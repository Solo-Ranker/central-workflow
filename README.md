# Konichiwa, Watashi wa Central-Workflow

A prototype, full-stack **Maker-Checker Workflow System** built with modern technologies. Features a **microfrontend architecture**, **type-safe backend**, and **Kubernetes-ready deployment**.

## 🌟 Features

- ✅ **Maker-Checker Pattern** - Dual approval for critical operations
- ✅ **Microfrontend Architecture** - Module Federation with independent deployments
- ✅ **Type-Safe Backend** - Hono.js + Drizzle ORM + PostgreSQL
- ✅ **Factory Pattern** - Extensible action handlers
- ✅ **Auto-Scaling** - Kubernetes HPA support
- ✅ **Persistent Storage** - PostgreSQL with PVC
- ✅ **Production-Ready** - Docker + Kubernetes manifests included

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Port 3000)                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Host App (React + Module Federation)             │ │
│  │  - Component Registry                              │ │
│  │  - Workflow Pages                                  │ │
│  │  - Dynamic Component Loading                       │ │
│  └────────────┬───────────────────────────────────────┘ │
│               │                                          │
│       ┌───────┼───────┐                                 │
│       ▼       ▼       ▼                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐                               │
│  │User │ │Acct │ │Promo│  Remote Microfrontends        │
│  │ App │ │ App │ │ App │  (Ports 3001-3003)            │
│  └─────┘ └─────┘ └─────┘                               │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Port 8080)                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Hono.js + TypeScript                              │ │
│  │  - Workflow Service (Business Logic)               │ │
│  │  - Action Handler Factory                          │ │
│  │  - Drizzle ORM (Type-safe SQL)                     │ │
│  └────────────┬───────────────────────────────────────┘ │
└───────────────┼─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL Database (Port 5432)                │
│  - workflow_actions (pending/approved/rejected)          │
│  - users, accounts, promotions                           │
│  - Persistent Volume (PVC in K8s)                        │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start with Docker Compose

The fastest way to run the entire system locally:

### Prerequisites

- **Docker** (v24+)
- **Docker Compose** (v2+)

### Run Everything

```bash
# Clone the repository
git clone <repository-url>
cd central-workflow

# Start all services
docker compose up --build

# Wait for all services to start (2-3 minutes)
# You'll see migration logs from the backend
```

### Access the Application

Once all containers are running:

- **Frontend (Host App)**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **User App**: http://localhost:3001
- **Account App**: http://localhost:3002
- **Promotion App**: http://localhost:3003
- **PostgreSQL**: localhost:5432

### Test the API

```bash
# Health check
curl http://localhost:8080/health

# Create a workflow action
curl -X POST http://localhost:8080/api/workflow/actions \
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

# List all actions
curl http://localhost:8080/api/workflow/actions
```

### Stop Everything

```bash
# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

## 📁 Project Structure

```
central-workflow/
├── backend/
│   └── workflow/              # Hono.js backend
│       ├── src/
│       │   ├── controllers/   # HTTP request handlers
│       │   ├── services/      # Business logic
│       │   ├── handlers/      # Action handlers (Factory)
│       │   ├── db/schema/     # Drizzle ORM schemas
│       │   ├── routes/        # API routes
│       │   ├── validators/    # Zod validation schemas
│       │   └── index.ts       # Entry point
│       ├── drizzle/           # Database migrations
│       ├── Dockerfile         # Multi-stage build
│       └── package.json
│
├── frontend/
│   ├── apps/
│   │   ├── host-app/          # Main container app
│   │   │   ├── src/
│   │   │   │   ├── components/WorkflowFactory/
│   │   │   │   ├── lib/registry.ts
│   │   │   │   ├── pages/
│   │   │   │   └── bootstrap.tsx
│   │   │   ├── Dockerfile
│   │   │   └── rsbuild.config.ts
│   │   │
│   │   ├── user-app/          # Remote MFE
│   │   ├── account-app/       # Remote MFE
│   │   └── promotion-app/     # Remote MFE
│   │
│   ├── packages/
│   │   └── shared-types/      # Shared TypeScript types
│   │
│   ├── pnpm-workspace.yaml
│   └── nginx.conf
│
├── k8s/                       # Kubernetes manifests
│   ├── namespace.yaml
│   ├── postgres-secret.yaml
│   ├── postgres-pvc.yaml
│   ├── deployments/
│   ├── services/
│   └── hpa/
│
├── tutorials/                 # Step-by-step guides
│   └── linkedin/
│       ├── backend-workflow-tutorial.md
│       ├── frontend-workflow-tutorial.md
│       └── kubernetes-deployment-tutorial.md
│
├── docker-compose.yaml        # Local development
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Hono.js (Fast, lightweight)
- **ORM**: Drizzle ORM (Type-safe SQL)
- **Database**: PostgreSQL 16
- **Validation**: Zod
- **Language**: TypeScript

### Frontend
- **Framework**: React 19
- **Build Tool**: RSBuild (Rust-powered)
- **Module Federation**: Webpack Module Federation v2
- **Styling**: TailwindCSS 4
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Language**: TypeScript

### DevOps
- **Containerization**: Docker (Multi-stage builds)
- **Orchestration**: Kubernetes
- **Package Manager**: pnpm (Workspace support)