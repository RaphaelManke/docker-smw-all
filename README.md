# Semantic Web Mediawiki - Docker Configurator #
This Repository helps you building a Semantic Web Mediawiki Instance running in a Docker Container. 
The project is the result of the seminar "Anwendungen von Semantic MediaWiki" at the [AIFB Karlsruhe](http://www.aifb.kit.edu/web/Hauptseite).

## Goal ##

The goal of the project was building a easy way of setting up a Instance of a [Mediawiki](https://www.mediawiki.org/) with an installed version of the [semantic media wiki extension](https://www.semantic-mediawiki.org).
On top of that it should be able platform independent, so it is not restricted to only one platform like windows or linux.

## Used Technologies ##

* Docker (incl. Docker-compose)
* Angular

## Usage ##

There is a two step approach applied, where first some configuration files are created with the help of an angular ui.
Having these configuration files, you can run a docker-compose command to run-up the actual Mediawiki instance.

The corresponding Project are in the submodules of the current repository.

The configuration UI can be started with the command:

```
docker run -p 4200:4200 raphaelmanke/docker-smw-configurator
```

Then the configurator will be available under `http://localhost:4200` 

The configurator will generate a .zip file with all needed files. 
The next steps are:
* extract the .zip file
* open terminal or commandline
* navigate to the extracted .zip folder
* run `docker-compose up` 
* wait till all images are downloaded and the container are started
* open your browser at `http://localhost:8080` 
* enjoy your brand new Mediawiki installation with installed semantic media wiki