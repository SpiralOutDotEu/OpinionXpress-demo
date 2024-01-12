# Running API Documentation and Mock Server

## Prerequisites

- Docker
- Docker Compose

## Overview

The `docker-compose.yml` file defines three services:
1. `openapi_builder`: Bundles the OpenAPI specification.
2. `openapi_mock`: Mock server based on the OpenAPI spec.
3. `openapi_swagger`: Swagger UI for API documentation.

## Getting Started

### Step 1: Place OpenAPI Specification

Put your `swagger.json` in the project root.

### Step 2: Running the Services

Run the following command:

```bash
docker-compose up
```

Alternatively, to run in detached mode:

```bash
docker-compose up -d
```

### Step 3: Accessing the Services

- **Mock Server:** `http://localhost:8080`
- **Swagger UI:** `http://localhost/docs`

## Using the Mock Server

Make HTTP requests to the mock server:

```bash
curl http://localhost:8080/api/<YOUR_ENDPOINT>
```

## Viewing API Documentation

Visit `http://localhost/docs` to view your API documentation.

## Exiting Docker Compose

If you ran `docker-compose up` (foreground mode) and are attached to the terminal:

- Press `Ctrl+C` to stop the containers.

If running in detached mode:

- Run `docker-compose down` to stop and remove the containers.

## Customization

Modify `docker-compose.yml` as needed. Rebuild containers after changes.