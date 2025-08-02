# NGINX + Node.js Load‐Balanced Web Server

A simple demonstration project showcasing:

* **Three Node.js backend servers** (containers) serving HTTP requests on ports 3001, 3002, and 3003.
* An **NGINX reverse proxy** configured as a load balancer (least-connections) forwarding requests to the backend pool.
* **Docker & Docker Compose** for building, orchestrating, and running the containers with a single command.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [File Structure](#file-structure)
4. [Configuration Details](#configuration-details)

   * [Node.js App (`server.js`)](#nodejs-app-serverjs)
   * [NGINX Config (`nginx.conf`)](#nginx-config-nginxconf)
   * [Dockerfile](#dockerfile)
   * [docker-compose.yaml](#docker-composeyaml)
5. [Getting Started](#getting-started)

   1. [Clone the Repo](#clone-the-repo)
   2. [Build & Run with Docker Compose](#build--run-with-docker-compose)
   3. [Verify Everything Is Working](#verify-everything-is-working)
6. [Customizing](#customizing)
7. [Troubleshooting](#troubleshooting)
8. [License](#license)

---

## Architecture

```
┌─────────────┐        ┌───────────────────┐
│             │        │  NGINX Proxy      │
│  Client     │ ─────> │  (port 8080)      │
│ (browser)   │        │                   │
└─────────────┘        └───────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Node.js Server  │ │ Node.js Server  │ │ Node.js Server  │
│ (3001)          │ │ (3002)          │ │ (3003)          │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

* **Load balancing** is performed by NGINX using the `least_conn` method.
* All three Node.js containers run the same app but are distinguished via an environment variable `APP_NAME`.

---

## Prerequisites

* [Docker](https://docs.docker.com/get-docker/) (v19+)
* [Docker Compose](https://docs.docker.com/compose/install/) (v1.25+)
* A Unix-like shell (Linux / macOS / WSL) or PowerShell (Windows)

---

## File Structure

```
├── docker-compose.yaml      # Composition of all services
├── Dockerfile               # Builds the Node.js app image
├── nginx.conf               # NGINX reverse-proxy & load-balancer config
├── server.js                # Simple Express-like HTTP server
├── index.html               # Static HTML served by the Node.js app
└── images/                  # Sample static assets
    └── ... (png, jpg, etc.)
```

---

## Configuration Details

### Node.js App (`server.js`)

* Simple HTTP server listening on `process.env.PORT || 3000`.
* Serves `index.html` and any files under `/images`.
* Logs requests and prints the `APP_NAME` environment variable in the response.

### NGINX Config (`nginx.conf`)

* **worker\_processes 1**: 1 worker process.
* **worker\_connections 1024**: Up to 1024 simultaneous connections.
* **upstream nodejs\_cluster**: Defines three backends at `127.0.0.1:3001`, `3002`, `3003` using `least_conn`.
* **server block**: Listens on `8080`, proxies `/` to `http://nodejs_cluster`, and forwards `Host` & `X-Real-IP` headers.

### Dockerfile

```dockerfile
FROM node:14
WORKDIR /app
COPY server.js index.html packages.json ./
COPY images ./images
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]
```

* Uses Node 14 official image
* Installs dependencies from `packages.json`
* Copies app source + static assets
* Exposes port `3000`

### docker-compose.yaml

```yaml
version: "3.8"
services:
  app1:
    build: .
    environment:
      - APP_NAME=App1
    ports:
      - "3001:3000"

  app2:
    build: .
    environment:
      - APP_NAME=App2
    ports:
      - "3002:3000"

  app3:
    build: .
    environment:
      - APP_NAME=App3
    ports:
      - "3003:3000"

  proxy:
    image: nginx:stable-alpine
    depends_on:
      - app1
      - app2
      - app3
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "8080:8080"
```

* **app1/app2/app3**: Three identical builds of the Node.js app with different `APP_NAME`.
* **proxy**: Uses the official NGINX Alpine image, mounts our custom `nginx.conf`, and exposes port 8080.

---

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/nginx-node-loadbalancer.git
cd nginx-node-loadbalancer
```

### 2. Build & Run with Docker Compose

```bash
docker-compose up --build -d
```

* `--build` forces rebuilding images if sources have changed.
* `-d` runs everything in detached (background) mode.

### 3. Verify Everything Is Working

* **List running containers**

  ```bash
  ```

docker-compose ps

````
- **Access your load-balanced app**
Open your browser to:  
- `http://localhost:8080/`
- Refresh several times; you’ll see the `APP_NAME` in the response rotate among `App1`, `App2`, and `App3` (least-connections keeps traffic even).

- **Inspect logs**
```bash
docker-compose logs -f proxy   # NGINX logs
docker-compose logs -f app1    # Node.js server logs
````

---

## Customizing

* **Change the number of backend servers**:

  * Duplicate or remove `appN` sections in `docker-compose.yaml`.
  * Update `upstream` block in `nginx.conf` accordingly.

* **Modify load-balancing algorithm**:

  ```nginx
  upstream nodejs_cluster {
    # round_robin (default)
    # ip_hash;
    least_conn;
  }
  ```

* **TLS / HTTPS**:

  * Generate self-signed certs or use Let’s Encrypt.
  * Mount `ssl_certificate` + `ssl_certificate_key` in NGINX container.
  * Update `listen 8080` to `listen 443 ssl;` in `nginx.conf`.

---

## Troubleshooting

* **Port conflicts**: Ensure 3001–3003 and 8080 are free on your host.
* **Permission denied** on logs/**certs**: Run `sudo chown -R $(whoami) ./logdir` or adjust Docker volume permissions.
* **Changing NGINX config**: After editing `nginx.conf`, reload with:

  ```bash
  docker-compose exec proxy nginx -s reload
  ```

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
