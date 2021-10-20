# containers-logger

## Getting Started
To get a local copy up and running follow these steps.

### Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Node.js
* docker
* docker-compose


### Cloning The GitHub Repository

```bash
$ git clone https://github.com/dmaizel/containers-logger.git
```

## Running Your Application
start the app server:

```bash
cd containers-logger
sudo docker-compose up --build
```

# Usage:
- Once the containers logger service is up and running it first starts to track all containers with the the same label as the you defined in the .env file.

The label should be defined as such:
```docker
LABEL "com.example.logger.label"=<The label of your containers-logger service>
```
- To attach to a specific container using its ID you can use this endpoint:
```
[POST] /api/container/:id/logs
```
- To detach from a specific container:
```
[DELETE] /api/container/:id/logs
```
- To get a list of all containers the exists in the DB:
```
[GET] /api/containers
```
- To get all logs for a specific container:
```
[GET] /api/container/:id/logs
```
- To connect to a live log stream:
```
[POST] /api/container/:id/logs/stream
```

<br>
<br>


# CLI Tool
<br>
