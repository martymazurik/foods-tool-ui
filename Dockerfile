# Angular Docker Image; Multi-stage build
# attribution: https://www.indellient.com/blog/how-to-dockerize-an-angular-application-with-nginx/

### STAGE 1: Compile & build ng codebase

FROM node:16.20.2 AS build

WORKDIR /app


COPY package.json package-lock.json  ./
# Install only production dependencies;  equivalent to:   npm install against /app/package.json
RUN npm ci
RUN npm install
# all of the files
COPY . /app
RUN npx ng build --prod --output-path=dist

### STAGE 2: Serve app with nginx server

FROM nginx:latest

## From ‘build’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]