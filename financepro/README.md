# FinancePro AI - Docker Deployment & Redesign Guide

This repository contains the production-ready Docker configuration for the complete **FinancePro AI** application. It also showcases a completely redesigned, premium dark-themed AI SaaS Landing Page styled to Vercel/Stripe/Linear aesthetics.

## Project Architecture

The workspace is containerized into a multi-container environment:
1. **Frontend**: A React/Vite Single Page Application built inside a Node Alpine container and served using an optimized production-ready Nginx server.
2. **Backend**: A Node.js / Express API server running on Node 22 Alpine, exposing endpoints on port 5000.
3. **Database (MongoDB)**: A local MongoDB instance mapped using Docker Volumes for data persistence, configured with health checks.

---

## Prerequisites

Before starting, ensure you have:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.
- An environment file `.env` based on `.env.example` at the root directory of the project.

---

## Environment Variables Configuration

Copy the sample environment variables file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in the values:
* `PORT`: Port backend runs on (default: `5000`).
* `MONGODB_URI`: Leave empty/commented to automatically use the local MongoDB container (`mongodb://mongodb:27017/personal_finance_db`), or paste your MongoDB Atlas URI.
* `JWT_SECRET` & `JWT_REFRESH_SECRET`: Secrets used to sign JWT authentication tokens.
* `OPENAI_API_KEY`: Key to enable AI chatbot suggestions and predictions.

---

## Docker Compose Commands Reference

Here are the essential Docker Compose commands to build, run, and manage your containers:

### 1. Build the Services
Compile and cache the container images for frontend and backend:
```bash
docker compose build
```

### 2. Start the Services in the Foreground
Run all services (Frontend, Backend, MongoDB) and view outputs in real-time:
```bash
docker compose up
```

### 3. Start the Services in the Background (Detached Mode)
Run the application in the background so it stays alive:
```bash
docker compose up -d
```

### 4. Stop the Services
Stop all running containers and preserve stored data:
```bash
docker compose down
```

### 5. View Services Logs
Follow logs for all containers or a specific service:
```bash
# View all logs
docker compose logs

# View and follow backend logs
docker compose logs -f backend
```

### 6. Verify Running Services
List the status of all active containers in the stack:
```bash
docker compose ps
```

---

## Application Access Links

Once the containers are started successfully:
- **Frontend URL**: [http://localhost:5173](http://localhost:5173) (Served via Nginx)
- **Backend API URL**: [http://localhost:5000](http://localhost:5000) (Served via Express Node 22)
- **Local MongoDB Endpoint**: `mongodb://localhost:27017/personal_finance_db`
