# Deploying a Full-Stack Application to Kubernetes from Scratch 🚢

## Introduction

You've built an amazing application. Now what? **Ship it to production!** 

In this comprehensive tutorial, I'll show you how to deploy a complete full-stack application (Backend + Microfrontends + Database) to **Kubernetes** with production-ready configurations. No more "it works on my machine" excuses!

This is Part 3 of our Maker-Checker Workflow System series. If you haven't read Part 1 (Backend) and Part 2 (Frontend), check those out first!

By the end of this guide, you'll have:
- ✅ **Dockerized** backend and frontend applications
- ✅ **Kubernetes cluster** running locally (Minikube)
- ✅ **PostgreSQL** with persistent storage
- ✅ **Secrets management** for sensitive data
- ✅ **Service discovery** and networking
- ✅ **Horizontal Pod Autoscaling** for high availability
- ✅ **NodePort services** for external access

**Tech Stack:**
- **Container Runtime:** Docker
- **Orchestration:** Kubernetes (Minikube for local)
- **Database:** PostgreSQL with PVC
- **Backend:** Node.js (Hono) in Alpine Linux
- **Frontend:** Nginx serving static React apps
- **Package Manager:** pnpm

---

## Part 1: Understanding Kubernetes Architecture

### The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Namespace: central-workflow               │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │  PostgreSQL  │  │   Backend    │  │  Host App   │ │ │
│  │  │  Deployment  │  │  Deployment  │  │  Deployment │ │ │
│  │  │  + PVC       │  │  (Hono API)  │  │  (React)    │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │ │
│  │         │                 │                  │       │ │
│  │  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼──────┐ │ │
│  │  │  postgres-   │  │  backend-    │  │  host-app   │ │ │
│  │  │  service     │  │  workflow    │  │  service    │ │ │
│  │  │  (ClusterIP) │  │  (NodePort)  │  │  (NodePort) │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │  User App    │  │ Account App  │  │  Promo App  │ │ │
│  │  │  Deployment  │  │  Deployment  │  │  Deployment │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │ │
│  │         │                 │                  │       │ │
│  │  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼──────┐ │ │
│  │  │  user-app    │  │  account-app │  │  promo-app  │ │ │
│  │  │  (NodePort)  │  │  (NodePort)  │  │  (NodePort) │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │         Secrets & ConfigMaps                     │ │ │
│  │  │  - postgres-secret (DATABASE_URL, passwords)     │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

External Access:
- Backend API: http://localhost:31000
- Host App: http://localhost:30000
- User App: http://localhost:30001
- Account App: http://localhost:30002
- Promotion App: http://localhost:30003
```

### Key Kubernetes Concepts

**1. Namespace** - Logical isolation for resources  
**2. Deployment** - Manages pod replicas and rolling updates  
**3. Service** - Stable network endpoint for pods  
**4. PersistentVolumeClaim (PVC)** - Persistent storage for stateful apps  
**5. Secret** - Secure storage for sensitive data  
**6. HorizontalPodAutoscaler (HPA)** - Auto-scaling based on metrics  

---

## Part 2: Environment Setup (Ubuntu Linux)

### Step 2.1: Install Docker

```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (avoid sudo)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
# Or run: newgrp docker

# Verify installation
docker --version
docker ps
```

### Step 2.2: Install Kubectl

```bash
# Download kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Make it executable
chmod +x kubectl

# Move to PATH
sudo mv kubectl /usr/local/bin/

# Verify installation
kubectl version --client
```

### Step 2.3: Install Minikube

```bash
# Download Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Install Minikube
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version

# Start Minikube cluster
minikube start --driver=docker --cpus=4 --memory=8192

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

**Expected output:**
```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   1m    v1.28.3
```

### Step 2.4: Enable Minikube Addons

```bash
# Enable metrics server (required for HPA)
minikube addons enable metrics-server

# Verify metrics server is running
kubectl get pods -n kube-system | grep metrics-server
```

---

## Part 3: Dockerizing the Applications

### Step 3.1: Backend Dockerfile

Navigate to `backend/workflow/` and create `Dockerfile`:

```dockerfile
# -----------------------------
# 1️⃣ Build stage
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN corepack enable && pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY . .

# Build TypeScript → dist
RUN pnpm run build


# -----------------------------
# 2️⃣ Production stage
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only required files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY package.json ./

# Security: non-root user
RUN addgroup -S hono && adduser -S hono -G hono
USER hono

ENV NODE_ENV=production
EXPOSE 8080

# Start app
CMD ["node", "dist/src/index.js"]
```

**Why Multi-Stage Build?**
- ✅ Smaller production image (only runtime dependencies)
- ✅ Faster builds (caching layers)
- ✅ More secure (no build tools in production)
- ✅ Includes migrations folder for auto-migration on startup

### Step 3.2: Build Backend Image

```bash
# From backend/workflow/ directory
docker build -t backend-workflow:latest .

# Verify image was created
docker images | grep backend-workflow

# Test the image locally (optional)
docker run -p 8080:8080 \
  -e DATABASE_URL=postgres://postgres:supersecret@host.docker.internal:5432/workflow \
  backend-workflow:latest
```

### Step 3.3: Frontend Dockerfile

Navigate to `frontend/` root and create `Dockerfile`:

```dockerfile
# -----------------------------
# Build stage
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Build arguments
ARG APP_NAME
ARG USER_APP_URL
ARG ACCOUNT_APP_URL
ARG PROMOTION_APP_URL
ARG REACT_APP_API_URL

ENV USER_APP_URL=${USER_APP_URL}
ENV ACCOUNT_APP_URL=${ACCOUNT_APP_URL}
ENV PROMOTION_APP_URL=${PROMOTION_APP_URL}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Make args available to build tools
ENV NODE_ENV=production

# Copy workspace files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy monorepo sources
COPY packages ./packages
COPY apps ./apps

# Install deps
RUN pnpm install --frozen-lockfile

# Build selected app
RUN pnpm --filter ${APP_NAME} build


# -----------------------------
# Runtime stage
# -----------------------------
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build argument again (ARG is per-stage)
ARG APP_NAME

# Copy built assets
COPY --from=builder /app/apps/${APP_NAME}/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Step 3.4: Build Frontend Images

```bash
# From frontend/ directory

# Build Host App
docker build \
  -t host-app:latest \
  --build-arg APP_NAME=host-app \
  --build-arg USER_APP_URL=http://localhost:30001 \
  --build-arg ACCOUNT_APP_URL=http://localhost:30002 \
  --build-arg PROMOTION_APP_URL=http://localhost:30003 \
  --build-arg REACT_APP_API_URL=http://localhost:31000 \
  .

# Build User App
docker build \
  -t user-app:latest \
  --build-arg APP_NAME=user-app \
  --build-arg APP_BASE_URL=http://localhost:30001 \
  .

# Build Account App
docker build \
  -t account-app:latest \
  --build-arg APP_NAME=account-app \
  --build-arg APP_BASE_URL=http://localhost:30002 \
  .

# Build Promotion App
docker build \
  -t promotion-app:latest \
  --build-arg APP_NAME=promotion-app \
  --build-arg APP_BASE_URL=http://localhost:30003 \
  .

# Verify all images
docker images | grep -E "host-app|user-app|account-app|promotion-app"
```

### Step 3.5: Load Images into Minikube

Since we're using local images, we need to load them into Minikube's Docker daemon:

```bash
# Load backend image
minikube image load backend-workflow:latest

# Load frontend images
minikube image load host-app:latest
minikube image load user-app:latest
minikube image load account-app:latest
minikube image load promotion-app:latest

# Verify images are in Minikube
minikube ssh docker images
```

---

## Part 4: Kubernetes Manifests

### Step 4.1: Create K8s Directory Structure

```bash
# From project root
mkdir -p k8s/{deployments,services,hpa}
cd k8s
```

Your structure should look like:
```
k8s/
├── namespace.yaml
├── postgres-secret.yaml
├── postgres-pvc.yaml
├── deployments/
│   ├── postgres.yaml
│   ├── backend-workflow.yaml
│   ├── frontend-host-app.yaml
│   ├── frontend-user-app.yaml
│   ├── frontend-account-app.yaml
│   └── frontend-promotion-app.yaml
├── services/
│   ├── postgres.yaml
│   ├── backend-workflow.yaml
│   ├── frontend-host-app.yaml
│   ├── frontend-user-app.yaml
│   ├── frontend-account-app.yaml
│   └── frontend-promotion-app.yaml
└── hpa/
    ├── backend-workflow.yaml
    ├── frontend-host-app.yaml
    ├── frontend-user-app.yaml
    ├── frontend-account-app.yaml
    └── frontend-promotion-app.yaml
```

### Step 4.2: Create Namespace

Create `k8s/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: central-workflow
```

**Why Namespace?**
- ✅ Logical isolation from other apps
- ✅ Resource quotas and limits
- ✅ Easier to manage and delete everything

### Step 4.3: Create Secrets

Create `k8s/postgres-secret.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: central-workflow
type: Opaque
stringData:
  # Connection string: postgres://<user>:<password>@<service-name>:<port>/<db-name>
  DATABASE_URL: postgresql://postgres:supersecret@postgres-service:5432/workflow
  POSTGRES_PASSWORD: supersecret
```

**⚠️ Security Note:** In production, use:
- Kubernetes Secrets with encryption at rest
- External secret managers (AWS Secrets Manager, HashiCorp Vault)
- Never commit secrets to Git!

### Step 4.4: Create Persistent Volume Claim

Create `k8s/postgres-pvc.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: central-workflow
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

**What is PVC?**
- Persistent storage that survives pod restarts
- Data persists even if PostgreSQL pod is deleted
- Essential for stateful applications like databases

### Step 4.5: PostgreSQL Deployment

Create `k8s/deployments/postgres.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: central-workflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: workflow
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: POSTGRES_PASSWORD
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
```

Create `k8s/services/postgres.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: central-workflow
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
```

**Service Type: ClusterIP (default)**
- Only accessible within the cluster
- Perfect for databases (security)

### Step 4.6: Backend Deployment

Create `k8s/deployments/backend-workflow.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-workflow
  namespace: central-workflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend-workflow
  template:
    metadata:
      labels:
        app: backend-workflow
    spec:
      containers:
        - name: backend-workflow
          image: backend-workflow:latest
          imagePullPolicy: Never # use the local image
          ports:
            - containerPort: 8080
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: DATABASE_URL
            - name: NODE_ENV
              value: "production"
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

Create `k8s/services/backend-workflow.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-workflow
  namespace: central-workflow
spec:
  type: NodePort
  selector:
    app: backend-workflow
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 31000
```

**Service Type: NodePort**
- Exposes service on each node's IP at a static port
- Accessible from outside the cluster
- Port range: 30000-32767

### Step 4.7: Frontend Host App Deployment

Create `k8s/deployments/frontend-host-app.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: host-app
  namespace: central-workflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: host-app
  template:
    metadata:
      labels:
        app: host-app
    spec:
      containers:
        - name: host-app
          image: host-app:latest
          imagePullPolicy: Never # use the local image
          ports:
            - containerPort: 80
          env:
            - name: USER_APP_URL
              value: http://localhost:30001
            - name: ACCOUNT_APP_URL
              value: http://localhost:30002
            - name: PROMOTION_APP_URL
              value: http://localhost:30003
            - name: REACT_APP_API_URL
              value: http://localhost:31000
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

Create `k8s/services/frontend-host-app.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: host-app
  namespace: central-workflow
spec:
  type: NodePort  
  selector:
    app: host-app
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30000
```

### Step 4.8: Remote Microfrontend Deployments

Create `k8s/deployments/frontend-user-app.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-app
  namespace: central-workflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: user-app
  template:
    metadata:
      labels:
        app: user-app
    spec:
      containers:
        - name: user-app
          image: user-app:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

Create `k8s/services/frontend-user-app.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: user-app
  namespace: central-workflow
spec:
  type: NodePort
  selector:
    app: user-app
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30001
```

**Repeat for Account App (port 30002) and Promotion App (port 30003)**

Create `k8s/deployments/frontend-account-app.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: account-app
  namespace: central-workflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: account-app
  template:
    metadata:
      labels:
        app: account-app
    spec:
      containers:
        - name: account-app
          image: account-app:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

Create `k8s/services/frontend-account-app.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: account-app
  namespace: central-workflow
spec:
  type: NodePort
  selector:
    app: account-app
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30002
```

Create `k8s/deployments/frontend-promotion-app.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: promotion-app
  namespace: central-workflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: promotion-app
  template:
    metadata:
      labels:
        app: promotion-app
    spec:
      containers:
        - name: promotion-app
          image: promotion-app:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

Create `k8s/services/frontend-promotion-app.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: promotion-app
  namespace: central-workflow
spec:
  type: NodePort
  selector:
    app: promotion-app
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30003
```

### Step 4.9: Horizontal Pod Autoscaler (HPA)

Create `k8s/hpa/backend-workflow.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-workflow
  namespace: central-workflow
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-workflow
  minReplicas: 1
  maxReplicas: 3
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```

**What is HPA?**
- Automatically scales pods based on CPU/Memory usage
- When CPU > 50%, adds more pods (up to 3)
- When CPU < 50%, removes pods (down to 1)
- Ensures high availability under load

Create similar HPAs for all frontend apps.

---

## Part 5: Deploying to Kubernetes

### Step 5.1: Apply Manifests in Order

```bash
# From k8s/ directory

# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Create secrets
kubectl apply -f postgres-secret.yaml

# 3. Create PVC
kubectl apply -f postgres-pvc.yaml

# 4. Deploy PostgreSQL
kubectl apply -f deployments/postgres.yaml
kubectl apply -f services/postgres.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n central-workflow --timeout=120s

# 5. Deploy Backend
kubectl apply -f deployments/backend-workflow.yaml
kubectl apply -f services/backend-workflow.yaml

# 6. Deploy Frontend Apps
kubectl apply -f deployments/frontend-host-app.yaml
kubectl apply -f services/frontend-host-app.yaml

kubectl apply -f deployments/frontend-user-app.yaml
kubectl apply -f services/frontend-user-app.yaml

kubectl apply -f deployments/frontend-account-app.yaml
kubectl apply -f services/frontend-account-app.yaml

kubectl apply -f deployments/frontend-promotion-app.yaml
kubectl apply -f services/frontend-promotion-app.yaml

# 7. Apply HPAs (optional)
kubectl apply -f hpa/backend-workflow.yaml
kubectl apply -f hpa/frontend-host-app.yaml
kubectl apply -f hpa/frontend-user-app.yaml
kubectl apply -f hpa/frontend-account-app.yaml
kubectl apply -f hpa/frontend-promotion-app.yaml
```

**Or apply everything at once:**

```bash
# Apply all manifests
kubectl apply -f .
kubectl apply -f deployments/
kubectl apply -f services/
kubectl apply -f hpa/
```

### Step 5.2: Verify Deployments

```bash
# Check all resources in namespace
kubectl get all -n central-workflow

# Check pods status
kubectl get pods -n central-workflow

# Expected output:
# NAME                                READY   STATUS    RESTARTS   AGE
# postgres-xxxxx                      1/1     Running   0          2m
# backend-workflow-xxxxx              1/1     Running   0          1m
# host-app-xxxxx                      1/1     Running   0          1m
# user-app-xxxxx                      1/1     Running   0          1m
# account-app-xxxxx                   1/1     Running   0          1m
# promotion-app-xxxxx                 1/1     Running   0          1m

# Check services
kubectl get svc -n central-workflow

# Check PVC
kubectl get pvc -n central-workflow

# Check secrets
kubectl get secrets -n central-workflow
```

### Step 5.3: View Pod Logs

```bash
# Backend logs
kubectl logs -f deployment/backend-workflow -n central-workflow

# You should see:
# ⏳ Running migrations...
# ✅ Migrations completed!
# 🚀 Server starting on port 8080

# Host app logs
kubectl logs -f deployment/host-app -n central-workflow
```

### Step 5.4: Describe Resources (Debugging)

```bash
# Describe a pod to see events and errors
kubectl describe pod <pod-name> -n central-workflow

# Check deployment status
kubectl describe deployment backend-workflow -n central-workflow

# Check service endpoints
kubectl get endpoints -n central-workflow
```

---

## Part 6: Accessing the Application

### Step 6.1: Get Minikube IP

```bash
# Get Minikube IP
minikube ip

# Usually: 192.168.49.2
```

### Step 6.2: Access Services

Open your browser and navigate to:

**Backend API:**
```
http://<minikube-ip>:31000/health
# Example: http://192.168.49.2:31000/health
```

**Host App:**
```
http://<minikube-ip>:30000
# Example: http://192.168.49.2:30000
```

**User App:**
```
http://<minikube-ip>:30001
```

**Account App:**
```
http://<minikube-ip>:30002
```

**Promotion App:**
```
http://<minikube-ip>:30003
```

### Step 6.3: Test the API

```bash
# Health check
curl http://$(minikube ip):31000/health

# Create a workflow action
curl -X POST http://$(minikube ip):31000/api/workflow/actions \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "create_user",
    "makerId": "maker123",
    "payload": {
      "email": "test@example.com",
      "username": "testuser",
      "fullName": "Test User"
    }
  }'

# List actions
curl http://$(minikube ip):31000/api/workflow/actions
```

### Step 6.4: Port Forwarding (Alternative Access)

If NodePort doesn't work, use port forwarding:

```bash
# Forward backend to localhost:8080
kubectl port-forward -n central-workflow deployment/backend-workflow 8080:8080

# Forward host-app to localhost:3000
kubectl port-forward -n central-workflow deployment/host-app 3000:80

# Now access at:
# Backend: http://localhost:8080
# Frontend: http://localhost:3000
```

---

## Part 7: Scaling and Monitoring

### Step 7.1: Manual Scaling

```bash
# Scale backend to 3 replicas
kubectl scale deployment backend-workflow --replicas=3 -n central-workflow

# Verify scaling
kubectl get pods -n central-workflow -l app=backend-workflow

# Scale down
kubectl scale deployment backend-workflow --replicas=1 -n central-workflow
```

### Step 7.2: Check HPA Status

```bash
# View HPA status
kubectl get hpa -n central-workflow

# Expected output:
# NAME               REFERENCE                     TARGETS   MINPODS   MAXPODS   REPLICAS
# backend-workflow   Deployment/backend-workflow   15%/50%   1         3         1

# Watch HPA in real-time
kubectl get hpa -n central-workflow --watch
```

### Step 7.3: Generate Load (Test Autoscaling)

```bash
# Install Apache Bench (if not installed)
sudo apt install apache2-utils

# Generate load
ab -n 10000 -c 100 http://$(minikube ip):31000/health

# Watch pods scale up
kubectl get pods -n central-workflow -w
```

### Step 7.4: View Resource Usage

```bash
# View pod resource usage
kubectl top pods -n central-workflow

# View node resource usage
kubectl top nodes
```

---

## Part 8: Updating and Rolling Updates

### Step 8.1: Update Application

```bash
# Make changes to your code
# Rebuild Docker image with new tag
docker build -t backend-workflow:v2 backend/workflow/

# Load into Minikube
minikube image load backend-workflow:v2

# Update deployment
kubectl set image deployment/backend-workflow \
  backend-workflow=backend-workflow:v2 \
  -n central-workflow

# Watch rollout status
kubectl rollout status deployment/backend-workflow -n central-workflow
```

### Step 8.2: Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment/backend-workflow -n central-workflow

# Rollback to previous version
kubectl rollout undo deployment/backend-workflow -n central-workflow

# Rollback to specific revision
kubectl rollout undo deployment/backend-workflow --to-revision=1 -n central-workflow
```

---

## Part 9: Cleanup

### Step 9.1: Delete All Resources

```bash
# Delete entire namespace (removes everything)
kubectl delete namespace central-workflow

# Or delete resources individually
kubectl delete -f k8s/
kubectl delete -f k8s/deployments/
kubectl delete -f k8s/services/
kubectl delete -f k8s/hpa/
```

### Step 9.2: Stop Minikube

```bash
# Stop Minikube cluster
minikube stop

# Delete Minikube cluster (complete cleanup)
minikube delete
```

---

## Part 10: Production Considerations

### Step 10.1: Use ConfigMaps for Non-Sensitive Config

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: central-workflow
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
```

### Step 10.2: Add Health Checks

```yaml
# Add to deployment
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Step 10.3: Use Ingress for Production

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: workflow-ingress
  namespace: central-workflow
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: workflow.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-workflow
                port:
                  number: 8080
          - path: /
            pathType: Prefix
            backend:
              service:
                name: host-app
                port:
                  number: 80
```

### Step 10.4: Add Resource Quotas

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: workflow-quota
  namespace: central-workflow
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "5"
```

### Step 10.5: Use External Secrets

```bash
# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets -n external-secrets-system --create-namespace

# Use AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
```

---

## Conclusion

Congratulations! 🎉 You've successfully deployed a full-stack application to Kubernetes! Here's what you accomplished:

✅ **Containerized** all applications with Docker  
✅ **Deployed** to Kubernetes with proper resource management  
✅ **Configured** persistent storage for PostgreSQL  
✅ **Secured** sensitive data with Kubernetes Secrets  
✅ **Exposed** services via NodePort  
✅ **Enabled** auto-scaling with HPA  
✅ **Implemented** rolling updates and rollbacks  

### Key Takeaways:

1. **Multi-stage Docker builds** reduce image size and improve security
2. **Namespaces** provide logical isolation
3. **PVCs** ensure data persistence for stateful apps
4. **Secrets** keep sensitive data secure
5. **Services** provide stable networking
6. **HPA** ensures high availability under load
7. **Resource limits** prevent resource exhaustion

### Next Steps:

1. **Set up CI/CD** - Automate builds and deployments
2. **Add Monitoring** - Prometheus + Grafana
3. **Add Logging** - ELK Stack or Loki
4. **Use Helm Charts** - Package and version your K8s manifests
5. **Deploy to Cloud** - AWS EKS, GCP GKE, or Azure AKS
6. **Add TLS/SSL** - Secure with Let's Encrypt
7. **Implement GitOps** - ArgoCD or Flux

### The Magic Moment ✨

When your backend pod starts, it automatically:
1. Connects to PostgreSQL
2. Detects pending migrations
3. Applies migrations
4. Starts the API server

**Zero manual intervention. Zero schema drift. Pure DevOps bliss!** 🚀

---

**Found this helpful?** Drop a ⭐ and let me know what you'd like to see next!

#Kubernetes #Docker #DevOps #CloudNative #Microservices #K8s #ContainerOrchestration #Infrastructure #SRE #Tutorial
