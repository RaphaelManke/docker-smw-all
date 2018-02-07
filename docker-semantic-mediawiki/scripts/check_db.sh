#!/bin/bash

# needs 3 Arguments
# $1 -> search term
# $2 -> file to search
# $3 -> readable name what is searched for (for logging)
function add_to_file {
    searchTerm=$1
    file=$2
    searchName=$3
    if grep -Rq "$searchTerm" "$file"
    then
        echo "$searchName already in $file file. Nothing to do."

        # code if found
    else
        if [ -e "$file" ]
        then
            echo "$searchTerm" >> "$file"
            UPDATE_NEEDED=1
            echo "added $searchName extension to $file file."
        else
            echo "Error $file does not exists. Can not add Extension"
        fi
        # code if not found
    fi

}
function update_mw {

    echo "running update scripts"
    php composer.phar update --no-dev
    echo "composer ended with $?"
    php "maintenance/update.php" --skip-external-dependencies
    echo "update ended with $?"


}
function main {
    echo "$@"
    BASE="/var/www/html/"
    cd "$BASE"
    INDICATOR_FILE="LocalSettings.php"
    if [ -f "$INDICATOR_FILE" ]; then
        echo "$INDICATOR_FILE exists. Database already initialized"

    else
        INSTALLED="-1"
        while [ "$INSTALLED" != 0 ]
        do
            echo "$INDICATOR_FILE file does not exist"
            # https://www.mediawiki.org/wiki/Manual:Install.php
            php maintenance/install.php \
                --dbname="$DATABASE_NAME" \
                --dbserver="$DATABASE_HOSTNAME" \
                --installdbuser="$DATABASE_USER" \
                --installdbpass="$DATABASE_PASSWORD" \
                --dbuser=$SMW_DATABASE_USER \
                --dbpass=$SMW_DATABASE_PASSWORD \
                --server="http://localhost:$SMW_HTTP_PORT" \
                --scriptpath="" \
                --lang=$SMW_LANGUAGE \
                --pass=$SMW_ADMIN_PASSWORD \
                "$SMW_INSTANCE_NAME" \
                "$SMW_ADMIN_USER"
            INSTALLED=$?
            echo "Installation finished with code $INSTALLED"
            sleep 1

        done
    fi

}
function install_smw {
    echo "starting to install SMW"

    #
    # check if smw is added to config
    #
    add_to_file 'require_once "$IP/extensions/SemanticMediaWiki/SemanticMediaWiki.php";' "$localSettings" "SMW - step 1"
    # TODO add correct hostname
    add_to_file "enableSemantics( '$SMW_HOSTNAME' );" "$localSettings" "SMW - step 2"

    echo "finished to install SMW"


}

function install_extensions {
    echo "starting to install Extensions"

    bash "$dir/install_extensions.sh" "$dir/extensions.json"

    echo "finished to install Extensions"

}

function ping_db {
    echo "try to ping Database"
    UNREACHEABLE=1
    UNREACHEABLE_COUNTER=0
    while [ $UNREACHEABLE -ne "0" ]
       #do ping -q -c 1 database &> /dev/null; UNREACHEABLE=$?; echo "try again"; sleep 1;
       do
        #main ;
        UNREACHEABLE=$?;
        echo "database not available or not ready. try again"
        UNREACHEABLE_COUNTER+=1
        if [ "$UNREACHEABLE_COUNTER" -gt "20" ]
        then
            echo    "more than $UNREACHEABLE_COUNTER attempts to ping the database failed.
                     Database seems to be not available"
            exit 2
        fi
        sleep 1
        done
    echo "Database is reachable and respond to ping."
    sleep 3

}

dir="$(pwd)"
localSettings="LocalSettings.php"

# try ping the database. without connection initialization fails.
ping_db

# run update script to make sure everything is up-to-date
#update_mw
# run main
main
# check if SM is activated, if not activate it
#install_smw

#  install or update referenced extensions
install_extensions
# run update script to make sure everything is up-to-date
update_mw


