# Building a Scalable Microfrontend Architecture with Module Federation 🎨

## Introduction

Ever wondered how large-scale applications like Netflix or Spotify manage their frontend at scale? The answer is **Microfrontends**! In this comprehensive tutorial, I'll show you how to build a production-ready microfrontend architecture using **Module Federation** and **RSBuild**.

This is Part 2 of our Maker-Checker Workflow System. If you haven't read Part 1 (Backend), I recommend checking that out first!

By the end of this guide, you'll have:
- ✅ A **Host Application** that dynamically loads remote microfrontends
- ✅ Multiple **Remote Apps** that can be developed and deployed independently
- ✅ A **Component Registry** pattern for dynamic component loading
- ✅ **Type-safe** communication between apps
- ✅ **Shared dependencies** to optimize bundle size

**Tech Stack:**
- **Build Tool:** RSBuild (Rust-powered, blazing fast)
- **Module Federation:** Webpack Module Federation v2
- **Framework:** React 19
- **Styling:** TailwindCSS 4
- **Language:** TypeScript
- **Package Manager:** pnpm (workspace support)

---

## Part 1: Understanding the Architecture

### The Big Picture

```
┌─────────────────────────────────────────────────────────┐
│                    Host App (Port 3000)                 │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Component Registry (Singleton)             │ │
│  │  - Maps action types to components                 │ │
│  │  - Lazy loads remote components                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Workflow Pages                             │ │
│  │  - Create Action (uses Factory)                    │ │
│  │  - List Actions                                    │ │
│  │  - Detail/Review (uses Factory)                    │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────┘
                   │
       ┌───────────┼──────────────┐
       │           │              │
       ▼           ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  User App   │ │ Account App │ │ Promo App   │
│  Port 3001  │ │  Port 3002  │ │  Port 3003  │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ CreateUser  │ │ CreateAcct  │ │ CreatePromo │
│ UserDetail  │ │ AcctDetail  │ │ PromoDetail │
│ Registration│ │ Registration│ │ Registration│
└─────────────┘ └─────────────┘ └─────────────┘
```

### Key Concepts

**1. Module Federation** - Share code between independently deployed applications
**2. Component Registry** - Central registry that maps action types to components
**3. Factory Pattern** - Dynamically render components based on action type
**4. Workspace Monorepo** - Manage multiple apps with shared packages

---

## Part 2: Environment Setup (Ubuntu Linux)

### Step 2.1: Prerequisites

Make sure you have these installed (from Part 1):
```bash
# Verify installations
node --version  # Should be v20+
pnpm --version  # Should be v8+
```

### Step 2.2: Create Frontend Workspace

```bash
# Navigate to your project root
cd ~/projects/central-workflow

# Create frontend folder structure
mkdir -p frontend
cd frontend

# Initialize pnpm workspace
pnpm init
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Create `.npmrc` for workspace configuration:

```bash
cat > .npmrc << 'EOF'
auto-install-peers=true
strict-peer-dependencies=false
EOF
```

Your structure should now look like:
```
central-workflow/
├── backend/
│   └── workflow/
└── frontend/
    ├── pnpm-workspace.yaml
    ├── .npmrc
    └── package.json
```

---

## Part 3: Shared Types Package

Before building apps, let's create shared TypeScript types that all apps will use.

### Step 3.1: Create Shared Types Package

```bash
# From frontend/ directory
mkdir -p packages/shared-types
cd packages/shared-types

# Initialize package
pnpm init
```

Edit `packages/shared-types/package.json`:

```json
{
  "name": "shared-types",
  "version": "1.0.0",
  "type": "module",
  "main": "./index.ts",
  "types": "./index.ts",
  "exports": {
    ".": "./index.ts"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

Create `packages/shared-types/index.ts`:

```typescript
import React from "react";

/**
 * Standard interface that all microfrontends must implement
 * This is the contract between Host App and Remote Apps
 */
export interface WorkflowComponentRegistration {
  actionType: string;  // e.g., "create_user"
  metadata: {
    name: string;
    description: string;
    icon?: string;
    category?: string;
  };
  components: {
    CreateForm: React.ComponentType<CreateFormProps>;
    DetailView: React.ComponentType<DetailViewProps>;
  };
}

/**
 * Props passed to Create Form components
 */
export interface CreateFormProps {
  onSubmit: (data: unknown) => Promise<void>;  // Triggers backend action
  onCancel: () => void;
}

/**
 * Props passed to Detail View components
 */
export interface DetailViewProps {
  isChecker: boolean;
  data: unknown;
  status: "PENDING" | "APPROVED" | "REJECTED";
  onApprove: () => void;
  onReject: (reason: string) => void;
}

/**
 * Action types enum for type safety
 */
export enum ActionTypes {
  CREATE_USER = 'create_user',
  CREATE_ACCOUNT = 'create_account',
  CREATE_PROMOTION = 'create_promotion',
}
```

**Why Shared Types?**
- ✅ Type safety across all apps
- ✅ Single source of truth for interfaces
- ✅ Compile-time errors if contracts are broken
- ✅ Better IDE autocomplete

---

## Part 4: Building the Host Application

The Host App is the main container that loads and orchestrates all remote microfrontends.

### Step 4.1: Create Host App Structure

```bash
# From frontend/ directory
mkdir -p apps/host-app
cd apps/host-app

# Initialize package
pnpm init
```

### Step 4.2: Install Dependencies

```bash
# Install dependencies
pnpm add react react-dom react-router-dom lucide-react dotenv shared-types@workspace:*

# Install dev dependencies
pnpm add -D @rsbuild/core @rsbuild/plugin-react @module-federation/enhanced @module-federation/rsbuild-plugin typescript @types/react @types/react-dom @types/node tailwindcss @tailwindcss/postcss postcss autoprefixer
```

### Step 4.3: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### Step 4.4: Configure RSBuild with Module Federation

Create `rsbuild.config.ts`:

```typescript
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import * as dotenv from "dotenv";

dotenv.config();

const USER_APP_URL = process.env.USER_APP_URL ?? "http://localhost:3001";
const ACCOUNT_APP_URL = process.env.ACCOUNT_APP_URL ?? "http://localhost:3002";
const PROMOTION_APP_URL = process.env.PROMOTION_APP_URL ?? "http://localhost:3003";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "host_app",
      remotes: {
        user_app: `user_app@${USER_APP_URL}/mf-manifest.json`,
        account_app: `account_app@${ACCOUNT_APP_URL}/mf-manifest.json`,
        promotion_app: `promotion_app@${PROMOTION_APP_URL}/mf-manifest.json`,
      },
      shared: ["react", "react-dom"],
    }),
  ],
  server: {
    port: 3000,
  },
  source: {
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL)
    },
  },
  output: {
    assetPrefix: process.env.APP_BASE_URL,
    distPath: {
      root: "dist",
    },
  },
});
```

**What's happening here?**
- `pluginModuleFederation` - Enables Module Federation
- `remotes` - Declares which remote apps to load
- `shared` - React/ReactDOM are shared (loaded once)
- Dynamic URLs from environment variables

### Step 4.5: Create Folder Structure

```bash
# From apps/host-app/
mkdir -p src/{components/WorkflowFactory,context,lib,pages}
```

### Step 4.6: Build the Component Registry

Create `src/lib/registry.ts`:

```typescript
import { WorkflowComponentRegistration } from 'shared-types';

class ComponentRegistry {
    private registrations = new Map<string, WorkflowComponentRegistration>();

    /**
     * Register a workflow component from a micro frontend
     */
    register(registration: WorkflowComponentRegistration): void {
        if (this.registrations.has(registration.actionType)) {
            console.warn(`Component for action type "${registration.actionType}" is already registered. Overwriting.`);
        }

        this.registrations.set(registration.actionType, registration);
        console.log(`Registered workflow component: ${registration.actionType}`, registration.metadata);
    }

    /**
     * Get a registered component by action type
     */
    getRegistration(actionType: string): WorkflowComponentRegistration | undefined {
        return this.registrations.get(actionType);
    }

    /**
     * Get all registered components
     */
    getAllRegistrations(): WorkflowComponentRegistration[] {
        return Array.from(this.registrations.values());
    }

    /**
     * Check if an action type is registered
     */
    hasRegistration(actionType: string): boolean {
        return this.registrations.has(actionType);
    }

    /**
     * Get all registered action types
     */
    getActionTypes(): string[] {
        return Array.from(this.registrations.keys());
    }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry();

// Export the class for testing purposes
export { ComponentRegistry };
```

**Registry Pattern Benefits:**
- ✅ Central place to manage all remote components
- ✅ Type-safe component lookup
- ✅ Easy to debug what's registered
- ✅ Singleton ensures consistency

### Step 4.7: Create API Client

Create `src/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface WorkflowAction {
    id: string;
    actionType: string;
    status: 'pending' | 'approved' | 'rejected';
    payload: any;
    makerId: string;
    checkerId?: string;
    reviewComment?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export async function createAction(
    actionType: string,
    payload: any,
    makerId: string
): Promise<WorkflowAction> {
    const response = await fetch(`${API_BASE_URL}/api/workflow/actions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            actionType,
            payload,
            makerId,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create action');
    }

    const result = await response.json();
    return result.data;
}

export async function listActions(filters?: {
    status?: string;
    actionType?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: WorkflowAction[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/workflow/actions?${params}`);

    if (!response.ok) {
        throw new Error('Failed to fetch actions');
    }

    const result = await response.json();
    return {
        data: result.data,
        pagination: result.pagination,
    };
}

export async function getActionById(id: string): Promise<WorkflowAction> {
    const response = await fetch(`${API_BASE_URL}/api/workflow/actions/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch action');
    }

    const result = await response.json();
    return result.data;
}

export async function reviewAction(
    id: string,
    status: 'approved' | 'rejected',
    checkerId: string,
    reviewComment?: string
): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/workflow/actions/${id}/review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            status,
            checkerId,
            reviewComment,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to review action');
    }

    const result = await response.json();
    return result.data;
}
```

### Step 4.8: Create the Factory Components

Create `src/components/WorkflowFactory/CreateFormFactory.tsx`:

```typescript
import React, { useState } from 'react';
import { componentRegistry } from '../../lib/registry';
import { createAction } from '../../lib/api';
import { CreateFormProps } from 'shared-types';

interface CreateFormFactoryProps {
    actionType: string;
    makerId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateFormFactory: React.FC<CreateFormFactoryProps> = ({
    actionType,
    makerId,
    onSuccess,
    onCancel,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const registration = componentRegistry.getRegistration(actionType);

    if (!registration) {
        return (
            <div className="p-5 border border-red-300 rounded-lg bg-red-50">
                <h3 className="text-red-800 font-bold mb-2">Component Not Found</h3>
                <p className="text-red-600">
                    No component registered for action type: <strong>{actionType}</strong>
                </p>
            </div>
        );
    }

    const CreateForm = registration.components.CreateForm;

    const handleSubmit = async (payload: any) => {
        setIsLoading(true);
        setError(null);

        try {
            await createAction(actionType, payload, makerId);
            onSuccess();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create action';
            setError(errorMessage);
            console.error('Error creating action:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formProps: CreateFormProps = {
        onSubmit: handleSubmit,
        onCancel,
    };

    return (
        <div>
            {error && (
                <div className="p-3 mb-4 border border-red-300 rounded-lg bg-red-50 text-red-800">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {isLoading && (
                <div className="p-3 mb-4 border border-blue-300 rounded-lg bg-blue-50 text-blue-800">
                    Creating action...
                </div>
            )}

            <CreateForm {...formProps} />
        </div>
    );
};
```

Create `src/components/WorkflowFactory/DetailViewFactory.tsx`:

```typescript
import React from 'react';
import { componentRegistry } from '../../lib/registry';
import { DetailViewProps } from 'shared-types';

interface DetailViewFactoryProps {
    actionType: string;
    data: any;
    status: "PENDING" | "APPROVED" | "REJECTED";
    isChecker: boolean;
    onApprove: () => void;
    onReject: (reason: string) => void;
}

export const DetailViewFactory: React.FC<DetailViewFactoryProps> = (props) => {
    const registration = componentRegistry.getRegistration(props.actionType);

    if (!registration) {
        return (
            <div className="p-5 border border-red-300 rounded-lg bg-red-50">
                <h3 className="text-red-800 font-bold mb-2">Component Not Found</h3>
                <p className="text-red-600">
                    No component registered for action type: <strong>{props.actionType}</strong>
                </p>
            </div>
        );
    }

    const DetailView = registration.components.DetailView;

    const detailProps: DetailViewProps = {
        data: props.data,
        status: props.status,
        isChecker: props.isChecker,
        onApprove: props.onApprove,
        onReject: props.onReject,
    };

    return <DetailView {...detailProps} />;
};
```

Create `src/components/WorkflowFactory/index.ts`:

```typescript
export * from './CreateFormFactory';
export * from './DetailViewFactory';
```

### Step 4.9: Create the Bootstrap File

This is crucial - it loads all remote microfrontends and registers their components.

Create `src/bootstrap.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { componentRegistry } from './lib/registry';

// Dynamically import and register remote microfrontends
async function loadRemotes() {
    try {
        // Load User App
        const userWorkflow = await import('user_app/workflow');
        componentRegistry.register(userWorkflow.userWorkflowRegistration);

        // Load Account App
        const accountWorkflow = await import('account_app/workflow');
        componentRegistry.register(accountWorkflow.accountWorkflowRegistration);

        // Load Promotion App
        const promotionWorkflow = await import('promotion_app/workflow');
        componentRegistry.register(promotionWorkflow.promotionWorkflowRegistration);

        console.log('✅ All remote microfrontends loaded successfully');
    } catch (error) {
        console.error('❌ Error loading remote microfrontends:', error);
    }
}

// Load remotes then render app
loadRemotes().then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
});
```

Create `src/index.ts`:

```typescript
import('./bootstrap');
export {};
```

**Why the bootstrap pattern?**
- Module Federation requires async loading
- Ensures remotes are loaded before app renders
- Prevents race conditions

### Step 4.10: Create Main App Component

Create `src/App.tsx`:

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CreateActionPage } from './pages/CreateActionPage';
import { ActionsListPage } from './pages/ActionsListPage';
import { ActionDetailPage } from './pages/ActionDetailPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/actions" element={<ActionsListPage />} />
                    <Route path="/actions/create" element={<CreateActionPage />} />
                    <Route path="/actions/:id" element={<ActionDetailPage />} />
                    <Route path="/" element={<Navigate to="/actions" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
```

### Step 4.11: Create Workflow Pages

Create `src/pages/CreateActionPage.tsx`:

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentRegistry } from '../lib/registry';
import { CreateFormFactory } from '../components/WorkflowFactory';

export const CreateActionPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedActionType, setSelectedActionType] = useState<string>('');

    const registrations = componentRegistry.getAllRegistrations();

    const handleSuccess = () => {
        alert('Action created successfully!');
        navigate('/actions');
    };

    const handleCancel = () => {
        navigate('/actions');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">Create New Action</h1>

                {!selectedActionType ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {registrations.map((reg) => (
                            <button
                                key={reg.actionType}
                                onClick={() => setSelectedActionType(reg.actionType)}
                                className="p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
                            >
                                <div className="text-4xl mb-3">{reg.metadata.icon}</div>
                                <h3 className="font-bold text-lg text-slate-800">{reg.metadata.name}</h3>
                                <p className="text-sm text-slate-500 mt-2">{reg.metadata.description}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => setSelectedActionType('')}
                            className="mb-4 text-blue-600 hover:underline"
                        >
                            ← Back to action types
                        </button>
                        <CreateFormFactory
                            actionType={selectedActionType}
                            makerId="current-user-id"
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
```

Create `src/pages/ActionsListPage.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listActions, WorkflowAction } from '../lib/api';

export const ActionsListPage: React.FC = () => {
    const navigate = useNavigate();
    const [actions, setActions] = useState<WorkflowAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActions();
    }, []);

    const loadActions = async () => {
        try {
            const result = await listActions();
            setActions(result.data);
        } catch (error) {
            console.error('Error loading actions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Workflow Actions</h1>
                    <button
                        onClick={() => navigate('/actions/create')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                    >
                        Create New Action
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Action Type</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Created</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actions.map((action) => (
                                <tr key={action.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-800">{action.actionType}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            action.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            action.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {action.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(action.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/actions/${action.id}`)}
                                            className="text-blue-600 hover:underline text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
```

### Step 4.12: Add Styling

Create `src/index.css`:

```css
@import "tailwindcss";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

Create `postcss.config.mjs`:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### Step 4.13: Update package.json Scripts

Edit `apps/host-app/package.json`:

```json
{
  "name": "host-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "rsbuild dev --open",
    "build": "rsbuild build",
    "preview": "rsbuild preview"
  },
  "dependencies": {
    "dotenv": "^17.2.3",
    "lucide-react": "^0.563.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-router-dom": "^7.13.0",
    "shared-types": "workspace:*"
  },
  "devDependencies": {
    "@module-federation/enhanced": "^0.23.0",
    "@module-federation/rsbuild-plugin": "^0.23.0",
    "@rsbuild/core": "^1.7.2",
    "@rsbuild/plugin-react": "^1.4.3",
    "@tailwindcss/postcss": "^4.1.18",
    "@types/node": "^25.2.1",
    "@types/react": "19.2.3",
    "@types/react-dom": "19.2.3",
    "autoprefixer": "^10.4.24",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3"
  }
}
```

---

## Part 5: Building a Remote Microfrontend (Account App)

Now let's build one of the remote apps. The pattern is the same for all remotes.

### Step 5.1: Create Account App Structure

```bash
# From frontend/ directory
mkdir -p apps/account-app
cd apps/account-app

# Initialize package
pnpm init
```

### Step 5.2: Install Dependencies

```bash
# Install dependencies
pnpm add react react-dom lucide-react shared-types@workspace:*

# Install dev dependencies
pnpm add -D @rsbuild/core @rsbuild/plugin-react @module-federation/enhanced @module-federation/rsbuild-plugin typescript @types/react @types/react-dom tailwindcss @tailwindcss/postcss postcss autoprefixer
```

### Step 5.3: Configure RSBuild for Remote

Create `rsbuild.config.ts`:

```typescript
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

const BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:3002';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'account_app',
      exposes: {
        './workflow': './src/registration.ts',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 3002,
    cors: { origin: '*' },
  },
  output: {
    assetPrefix: BASE_URL,
    distPath: {
      root: "dist",
    },
  },
});
```

**Key differences from Host:**
- `exposes` instead of `remotes` - this app EXPOSES components
- `'./workflow'` - the module name that Host will import
- CORS enabled - allows Host to fetch this app

### Step 5.4: Create Folder Structure

```bash
mkdir -p src/components
```

### Step 5.5: Create Account Form Component

Create `src/components/CreateAccountForm.tsx`:

```typescript
import React, { useState } from 'react';
import { CreateFormProps } from 'shared-types';
import { CreditCard, User, Hash, Briefcase, DollarSign, Send, X, AlertCircle, PiggyBank } from 'lucide-react';

export const CreateAccountForm: React.FC<CreateFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        userId: '',
        accountNumber: '',
        accountType: 'savings',
        balance: '',
        currency: 'USD',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.userId) {
            newErrors.userId = 'User ID is required';
        }

        if (!formData.accountNumber) {
            newErrors.accountNumber = 'Account number is required';
        } else if (!/^\d{10,12}$/.test(formData.accountNumber)) {
            newErrors.accountNumber = 'Account number must be 10-12 digits';
        }

        if (!formData.accountType) {
            newErrors.accountType = 'Account type is required';
        }

        if (formData.balance && isNaN(Number(formData.balance))) {
            newErrors.balance = 'Balance must be a valid number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                actionType: 'create_account' as const,
                userId: formData.userId,
                accountNumber: formData.accountNumber,
                accountType: formData.accountType,
                ...(formData.balance && { balance: formData.balance }),
                ...(formData.currency && { currency: formData.currency }),
            };

            await onSubmit(payload);
        } catch (error) {
            console.error('Error submitting form:', error);
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-xl mx-auto">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg">
                        <PiggyBank size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Create New Account</h2>
                </div>
                <p className="text-sm text-slate-500">
                    Enter account details for approval workflow
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User ID */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <User size={12} />
                            User ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.userId}
                            onChange={(e) => handleChange('userId', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.userId ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500`}
                            placeholder="e.g. USER-001"
                            disabled={isSubmitting}
                        />
                        {errors.userId && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <AlertCircle size={12} />
                                {errors.userId}
                            </span>
                        )}
                    </div>

                    {/* Account Number */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Hash size={12} />
                            Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => handleChange('accountNumber', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.accountNumber ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500`}
                            placeholder="10-12 digit number"
                            disabled={isSubmitting}
                        />
                        {errors.accountNumber && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <AlertCircle size={12} />
                                {errors.accountNumber}
                            </span>
                        )}
                    </div>
                </div>

                {/* Account Type */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Briefcase size={12} />
                        Account Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.accountType}
                        onChange={(e) => handleChange('accountType', e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                        disabled={isSubmitting}
                    >
                        <option value="savings">Savings Account</option>
                        <option value="checking">Checking Account</option>
                        <option value="investment">Investment Account</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Send size={18} />
                                Submit for Review
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
```

### Step 5.6: Create Detail View Component

Create `src/components/AccountDetailView.tsx`:

```typescript
import React from 'react';
import { DetailViewProps } from 'shared-types';

export const AccountDetailView: React.FC<DetailViewProps> = ({
    data,
    status,
    isChecker,
    onApprove,
    onReject,
}) => {
    const accountData = data as any;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Account Details</h3>
            
            <div className="space-y-3">
                <div>
                    <span className="text-sm text-slate-500">User ID:</span>
                    <p className="font-medium text-slate-800">{accountData.userId}</p>
                </div>
                <div>
                    <span className="text-sm text-slate-500">Account Number:</span>
                    <p className="font-medium text-slate-800">{accountData.accountNumber}</p>
                </div>
                <div>
                    <span className="text-sm text-slate-500">Account Type:</span>
                    <p className="font-medium text-slate-800">{accountData.accountType}</p>
                </div>
                <div>
                    <span className="text-sm text-slate-500">Balance:</span>
                    <p className="font-medium text-slate-800">${accountData.balance || '0.00'}</p>
                </div>
            </div>

            {isChecker && status === 'PENDING' && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                    <button
                        onClick={onApprove}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => onReject('Rejected by checker')}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                    >
                        Reject
                    </button>
                </div>
            )}
        </div>
    );
};
```

### Step 5.7: Create Registration File

This is the KEY file that exposes your components to the Host app.

Create `src/registration.ts`:

```typescript
import { WorkflowComponentRegistration } from 'shared-types';
import { CreateAccountForm } from './components/CreateAccountForm';
import { AccountDetailView } from './components/AccountDetailView';

export const accountWorkflowRegistration: WorkflowComponentRegistration = {
    actionType: 'create_account',
    metadata: {
        name: 'Create Account',
        description: 'Create a new financial account for a user',
        category: 'Account Management',
        icon: '💳',
    },
    components: {
        CreateForm: CreateAccountForm,
        DetailView: AccountDetailView,
    },
};
```

**This is the magic!** 🎩✨
- Exports a standard registration object
- Host app imports this via Module Federation
- Registers components in the Component Registry

### Step 5.8: Create Entry Files

Create `src/index.ts`:

```typescript
import('./bootstrap');
export {};
```

Create `src/bootstrap.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

Create `src/App.tsx`:

```typescript
import React from 'react';

function App() {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">Account App (Remote)</h1>
                <p className="text-slate-600">
                    This is a standalone remote microfrontend. 
                    It exposes components to the Host App via Module Federation.
                </p>
            </div>
        </div>
    );
}

export default App;
```

Create `src/index.css`:

```css
@import "tailwindcss";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

Create `postcss.config.mjs`:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### Step 5.9: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

### Step 5.10: Update package.json

Edit `apps/account-app/package.json`:

```json
{
  "name": "account-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "rsbuild dev",
    "build": "rsbuild build",
    "preview": "rsbuild preview"
  },
  "dependencies": {
    "lucide-react": "^0.563.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "shared-types": "workspace:*"
  },
  "devDependencies": {
    "@module-federation/enhanced": "^0.23.0",
    "@module-federation/rsbuild-plugin": "^0.23.0",
    "@rsbuild/core": "^1.7.2",
    "@rsbuild/plugin-react": "^1.4.3",
    "@tailwindcss/postcss": "^4.1.18",
    "@types/react": "19.2.3",
    "@types/react-dom": "19.2.3",
    "autoprefixer": "^10.4.24",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3"
  }
}
```

---

## Part 6: Running the Application

### Step 6.1: Install All Dependencies

```bash
# From frontend/ root
pnpm install
```

This installs dependencies for ALL apps in the workspace!

### Step 6.2: Start the Remote Apps

Open 3 separate terminals:

**Terminal 1 - Account App:**
```bash
cd apps/account-app
pnpm dev
```

**Terminal 2 - User App (if created):**
```bash
cd apps/user-app
pnpm dev
```

**Terminal 3 - Promotion App (if created):**
```bash
cd apps/promotion-app
pnpm dev
```

### Step 6.3: Start the Host App

**Terminal 4 - Host App:**
```bash
cd apps/host-app
pnpm dev
```

### Step 6.4: Open in Browser

Navigate to `http://localhost:3000`

You should see:
- ✅ Host app loads
- ✅ Remote components are fetched
- ✅ Component Registry shows all registered actions
- ✅ You can create actions using remote forms

---

## Part 7: How It All Works Together

### The Flow:

1. **Host App Starts** → Loads `bootstrap.tsx`
2. **Bootstrap** → Dynamically imports remote modules
   ```typescript
   const accountWorkflow = await import('account_app/workflow');
   ```
3. **Module Federation** → Fetches `account-app` from `http://localhost:3002`
4. **Registration** → Adds components to Component Registry
5. **User Clicks "Create Account"** → Factory looks up `create_account` in registry
6. **Factory Renders** → Loads `CreateAccountForm` from account-app
7. **Form Submits** → Calls backend API
8. **Backend Processes** → Creates workflow action

### The Magic of Module Federation:

```
Host App (localhost:3000)
    │
    ├─ Imports: import('account_app/workflow')
    │
    └─ Module Federation fetches from:
       http://localhost:3002/mf-manifest.json
       │
       └─ Returns: CreateAccountForm component
          │
          └─ Rendered in Host App!
```

---

## Conclusion

Congratulations! 🎉 You've built a production-ready microfrontend architecture! Here's what you accomplished:

✅ **Module Federation** - Dynamic remote loading  
✅ **Component Registry** - Centralized component management  
✅ **Factory Pattern** - Dynamic component rendering  
✅ **Type Safety** - Shared types across all apps  
✅ **Independent Deployment** - Each app can deploy separately  
✅ **Scalability** - Easy to add new microfrontends  

### Key Benefits:

1. **Team Autonomy** - Different teams can own different remotes
2. **Independent Deployment** - Deploy account-app without touching host
3. **Code Sharing** - React/ReactDOM loaded once
4. **Type Safety** - Compile-time errors across boundaries
5. **Lazy Loading** - Only load what you need

### Next Steps:

1. **Add Authentication** - Protect routes with auth
2. **Add Error Boundaries** - Graceful fallbacks for failed remotes
3. **Add Loading States** - Better UX during remote loading
4. **Optimize Bundle** - Code splitting and caching
5. **Deploy to Production** - Docker + Kubernetes

---

**Found this helpful?** Drop a ⭐ and let me know what you'd like to see next!

#Microfrontends #ModuleFederation #React #TypeScript #WebDevelopment #Architecture #RSBuild #ScalableArchitecture #FrontendEngineering #Tutorial
