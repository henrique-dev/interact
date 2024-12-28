# Interact

Interact is a video calling application based on WebRTC. It allows users to make video calls, exchange messages, and share files. Also allow users to interact with the environment.

## Requirements

- HTTPS is mandatory to run the application, as WebRTC requires a secure connection.
- The application uses a Socket.IO server for signaling. It supports two storage modes:
  - In-memory (default).
  - Redis (for persistence and scalability).

To use Redis storage, you need to set the Redis URL in the `.env` file.

## Getting Started

### Running with Docker

#### Build the Docker image

Use the following command to build the application image:

```bash
./bin/dev-build
```

#### Set up environment variables

Create the .env file based on the .env-example template. This file allows you to configure the application port and the Redis URL. Example:

```bash
# Port for the application
PORT=3050

# Redis URL if use redis storage. Leave blank if want to use memory storage
REDIS_URL=redis://redis:6379
```

#### Run the application

Start the application with the following command:

```bash
./bin/dev-up
```

To run the application in the background, use:

```bash
./bin/dev-start
```

### Running Locally

#### Navigate to the project directory

Enter the root directory of the application:

```bash
cd application
```

#### Install dependencies

Install the project dependencies with:

```bash
npm install
```

#### Set up HTTPS

Generate the required certificates for running the application locally with HTTPS:

```bash
npm run ca
```

#### Start the application

Run the server locally with:

```bash
npm run dev
```

## Notes

- Ensure Redis is running if you choose to use it as the storage backend.
- Check if the configured ports are available in your environment.

## Assets

- https://sscary.itch.io/the-adventurer-female
- https://penzilla.itch.io/top-down-retro-interior
