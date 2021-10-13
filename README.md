# node-rabbitmq

Simple project to work with RabbitMQ instance in the Node.js environment.

## Getting Started

### Prerequisites

- [Install Docker](https://docs.docker.com/install/)
- [Install Node.js](https://nodejs.org/en/download/)

First get and run rabbitmq docker image

```bash
docker run -d -p 5672:5672 -p 15672:15672  --name local-rabbit rabbitmq
```

Next run Node.js part

```bash
npm install
npm start
```
