# Create image based on Node 8
FROM node:8

# Create a directory where our app will be placed
RUN mkdir -p /usr/src/app

# Change directory so that our commands run inside this new directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package.json /usr/src/app

# Install dependecies
RUN npm install --no-progress --silent

# Install prebuild material components
RUN npm install --save @angular/material @angular/cdk --silent
RUN npm install --save @angular/animations --silent
RUN npm install --save hammerjs --silent

# Install FileSaver + typescript definitions for it
RUN npm install file-saver --save --silent
RUN npm install @types/file-saver --save-dev --silent

#Install JSZip + typescript definitons for it
RUN npm install jszip --silent
RUN npm install --save @types/jszip --silent

# Get all the code needed to run the app
COPY . /usr/src/app

# Expose the port the app runs in
EXPOSE 4200

# Serve the app
CMD ["npm", "start"]
