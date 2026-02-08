# Frontend Monorepo

This frontend monorepo contains **multiple micro-frontends** using **RSBuild + Module Federation**:

- **Host App** – main container loading remote micro-frontends  
- **User App** – exposed as a remote  
- **Account App** – exposed as a remote  
- **Promotion App** – exposed as a remote  

Each app can be built and deployed independently using Docker.

---

## Prerequisites

- **Node.js** >= 20  
- **pnpm** >= 8  
- **Docker** >= 24  
- Optional: **Kubernetes** cluster for production deployment  

---

## Environment Variables

Each micro-frontend supports environment configuration via **build arguments**:

| Argument | Description | Example |
|----------|------------|---------|
| `APP_NAME` | Name of the micro-frontend to build | `host-app` |
| `APP_BASE_URL` | Public URL of the micro-frontend (for Module Federation asset loading) | `http://localhost:3001` |

---

## Build Docker Images

> Build **from the root of the monorepo** to ensure pnpm workspace dependencies are resolved correctly.

### 1. Host App

```bash
docker build \
  -t host-app:latest \
  --build-arg USER_APP_URL=http://localhost:30001 \
  --build-arg ACCOUNT_APP_URL=http://localhost:30002 \
  --build-arg PROMOTION_APP_URL=http://localhost:30003 \
  --build-arg APP_NAME=host-app \
  --build-arg REACT_APP_API_URL=http://localhost:31000 \
  .
```

### 2. User App

```bash
docker build \
  -t user-app:latest \
  --build-arg APP_NAME=user-app \
  --build-arg APP_BASE_URL=http://localhost:30001 \
  .
```

### 3. Account App

```bash
docker build \
  -t account-app:latest \
  --build-arg APP_NAME=account-app \
  --build-arg APP_BASE_URL=http://localhost:30002 \
  .
```

### 4. Promotion App

```bash
docker build \
  -t promotion-app:latest \
  --build-arg APP_NAME=promotion-app \
  --build-arg APP_BASE_URL=http://localhost:30003 \
  .
```