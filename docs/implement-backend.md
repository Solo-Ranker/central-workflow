# Building a Prototype Maker-Checker Workflow System from Scratch 🚀

## Introduction

Have you ever wondered how banks and financial institutions ensure that critical operations require dual approval? That's the **Maker-Checker pattern** in action! In this comprehensive tutorial, I'll walk you through building a prototype workflow system from the ground up using modern TypeScript, Hono.js, and PostgreSQL.

By the end of this guide, you'll have a fully functional backend that:
- ✅ Implements the Maker-Checker approval pattern
- ✅ Uses the Factory Pattern for extensibility
- ✅ Provides type-safe database operations with Drizzle ORM
- ✅ Validates all inputs with Zod schemas
- ✅ Follows clean architecture principles

**Tech Stack:**
- **Runtime:** Node.js 20+
- **Framework:** Hono.js (Fast, lightweight web framework)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM (Type-safe SQL)
- **Validation:** Zod
- **Language:** TypeScript

---

## Part 1: Environment Setup (Ubuntu Linux)

### Step 1.1: Install Prerequisites

First, let's ensure you have all the necessary tools installed on your Ubuntu system.

```bash
# Update package list
sudo apt update

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version

# Install pnpm (faster package manager)
npm install -g pnpm

# Verify pnpm installation
pnpm --version
```

### Step 1.2: Install PostgreSQL with Docker

```bash
docker run --name workflow-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=supersecret \
  -e POSTGRES_DB=workflow \
  -p 5432:5432 \
  -d postgres:16-alpine
```

---

## Part 2: Project Structure Setup

### Step 2.1: Create Project Directory

```bash
# Create the main project folder
mkdir -p ~/projects/central-workflow
cd ~/projects/central-workflow

# Initialize git repository
git init

# Create backend folder structure
mkdir -p backend/workflow
cd backend/workflow
```

### Step 2.2: Initialize Node.js Project

```bash
# Initialize package.json
pnpm init

# Your folder structure should now look like:
# central-workflow/
# └── backend/
#     └── workflow/
#         └── package.json
```

### Step 2.3: Install Dependencies

```bash
# Install production dependencies
pnpm add hono @hono/node-server drizzle-orm pg postgres zod dotenv bcryptjs

# Install development dependencies
pnpm add -D drizzle-kit tsx typescript @types/node @types/pg @types/bcryptjs
```

**What each package does:**
- `hono` - Fast web framework (like Express but faster)
- `@hono/node-server` - Node.js adapter for Hono
- `drizzle-orm` - Type-safe ORM for database operations
- `pg` / `postgres` - PostgreSQL client libraries
- `zod` - Runtime type validation
- `bcryptjs` - Password hashing
- `tsx` - TypeScript execution engine
- `drizzle-kit` - Database migration tool

### Step 2.4: Initialize TypeScript

```bash
# Generate tsconfig.json
pnpm tsc --init
```

Now edit `tsconfig.json` to configure TypeScript properly:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 2.5: Update package.json Scripts

Edit your `package.json` to add these scripts:

```json
{
  "name": "workflow",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@hono/node-server": "^1.19.9",
    "bcryptjs": "^3.0.3",
    "dotenv": "^17.2.3",
    "drizzle-orm": "^0.45.1",
    "hono": "^4.11.7",
    "pg": "^8.17.2",
    "postgres": "^3.4.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^3.0.0",
    "@types/node": "^20.11.17",
    "@types/pg": "^8.16.0",
    "drizzle-kit": "^0.31.8",
    "tsx": "^4.7.1",
    "typescript": "^5.8.3"
  }
}
```

### Step 2.6: Create Environment Configuration

Create a `.env` file in the `backend/workflow` directory:

```bash
# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgres://postgres:supersecret@localhost:5432/workflow
PORT=8080
NODE_ENV=development
JWT_SECRET=your-secret-key-change-it-in-prod
EOF
```

Create a `.gitignore` file:

```bash
cat > .gitignore << 'EOF'
node_modules
dist
.env
*.log
.DS_Store
drizzle/migrations
EOF
```

---

## Part 3: Database Schema Design with Drizzle ORM

### Step 3.1: Create Folder Structure

```bash
# Create necessary folders
mkdir -p src/db/schema
mkdir -p src/types
mkdir -p src/handlers
mkdir -p src/services
mkdir -p src/controllers
mkdir -p src/routes
mkdir -p src/validators
mkdir -p src/middlewares
```

Your structure should now look like:
```
backend/workflow/
├── src/
│   ├── db/
│   │   └── schema/
│   ├── types/
│   ├── handlers/
│   ├── services/
│   ├── controllers/
│   ├── routes/
│   ├── validators/
│   └── middlewares/
├── package.json
├── tsconfig.json
└── .env
```

### Step 3.2: Define Database Schemas

Create `src/db/schema/workflow-actions.ts`:

```typescript
import { pgTable, uuid, varchar, timestamp, text, jsonb } from 'drizzle-orm/pg-core';

export const workflowActions = pgTable('workflow_actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  payload: jsonb('payload').notNull(), 
  makerId: varchar('maker_id', { length: 255 }).notNull(),
  checkerId: varchar('checker_id', { length: 255 }), 
  reviewComment: text('review_comment'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type WorkflowAction = typeof workflowActions.$inferSelect;
export type NewWorkflowAction = typeof workflowActions.$inferInsert;
```

**Explanation:**
- `workflowActions` table stores all pending/approved/rejected actions
- `payload` is JSONB - flexible storage for different action types
- `makerId` - who created the action
- `checkerId` - who approved/rejected it
- `status` - pending/approved/rejected

Create `src/db/schema/users.ts`:

```typescript
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('MAKER').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

Create `src/db/schema/accounts.ts`:

```typescript
import { pgTable, uuid, varchar, timestamp, decimal } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  accountNumber: varchar('account_number', { length: 50 }).notNull().unique(),
  accountType: varchar('account_type', { length: 50 }).notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
```

Create `src/db/schema/promotions.ts`:

```typescript
import { pgTable, uuid, varchar, timestamp, text, decimal, boolean } from 'drizzle-orm/pg-core';

export const promotions = pgTable('promotions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 20 }).notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;
```

Create `src/db/schema/index.ts` to export all schemas:

```typescript
export * from './workflow-actions.js';
export * from './users.js';
export * from './accounts.js';
export * from './promotions.js';
```

### Step 3.3: Configure Drizzle

Create `drizzle.config.ts` in the root of `backend/workflow`:

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Step 3.4: Create Database Connection

Create `src/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;

// Create PostgreSQL connection
const client = postgres(connectionString);

// Create Drizzle database instance
export const db = drizzle(client, { schema });

export type Database = typeof db;
```

Create `src/db/migrate.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log('⏳ Running migrations...');

  await migrate(db, { migrationsFolder: 'drizzle' });

  console.log('✅ Migrations completed!');

  await sql.end();
}
```

### Step 3.5: Generate and Run Migrations

```bash
# Generate migration files from schema
pnpm db:generate

# This creates SQL migration files in drizzle/ folder
# You should see: drizzle/0000_*.sql

# Run migrations to create tables
pnpm db:migrate
```

**What just happened?**
1. Drizzle read your TypeScript schema files
2. Generated SQL migration files
3. Applied those migrations to your PostgreSQL database
4. Created all tables: `workflow_actions`, `users`, `accounts`, `promotions`

---

## Part 4: Type Definitions and Validation

### Step 4.1: Define Workflow Types

Create `src/types/workflow.type.ts`:

```typescript
export const ActionTypes = {
  CREATE_USER: 'create_user',
  CREATE_ACCOUNT: 'create_account',
  CREATE_PROMOTION: 'create_promotion',
} as const;

export type ActionType = typeof ActionTypes[keyof typeof ActionTypes];

export const ActionStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ActionStatusType = typeof ActionStatus[keyof typeof ActionStatus];

// Base payload interface
export interface BaseActionPayload {
  actionType: ActionType;
}

// Create User Payload
export interface CreateUserPayload extends BaseActionPayload {
  actionType: typeof ActionTypes.CREATE_USER;
  email: string;
  username: string;
  fullName: string;
}

// Create Account Payload
export interface CreateAccountPayload extends BaseActionPayload {
  actionType: typeof ActionTypes.CREATE_ACCOUNT;
  userId: string;
  accountNumber: string;
  accountType: string;
  balance: string;
  currency: string;
}

// Create Promotion Payload
export interface CreatePromotionPayload extends BaseActionPayload {
  actionType: typeof ActionTypes.CREATE_PROMOTION;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  startDate: string;
  endDate: string;
}

// Union type for all payloads
export type ActionPayload = 
  | CreateUserPayload 
  | CreateAccountPayload 
  | CreatePromotionPayload;
```

### Step 4.2: Create Zod Validation Schemas

Create `src/validators/workflow.validator.ts`:

```typescript
import { z } from 'zod';

// Create User Validation
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(1, 'Full name is required'),
});

// Create Account Validation
export const createAccountSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  accountNumber: z.string().min(5, 'Account number must be at least 5 characters'),
  accountType: z.enum(['savings', 'checking', 'investment']),
  balance: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid balance format'),
  currency: z.string().length(3, 'Currency must be 3 characters (e.g., USD)'),
});

// Create Promotion Validation
export const createPromotionSchema = z.object({
  code: z.string().min(3, 'Promotion code must be at least 3 characters'),
  name: z.string().min(1, 'Promotion name is required'),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid discount value'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
});

// Workflow Action Creation Validation
export const createWorkflowActionSchema = z.object({
  actionType: z.string(),
  makerId: z.string().min(1, 'Maker ID is required'),
  payload: z.record(z.any()),
});

// Review Action Validation
export const reviewActionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  checkerId: z.string().min(1, 'Checker ID is required'),
  reviewComment: z.string().optional(),
});
```

---

## Part 5: Implementing the Factory Pattern

### Step 5.1: Create Base Handler

Create `src/handlers/base.handler.ts`:

```typescript
import { type Database } from '../db/index.js';

export interface ActionHandler<T = any> {
  validate(payload: T): Promise<void>;
  execute(db: Database, payload: T): Promise<any>;
}

export abstract class BaseActionHandler<T> implements ActionHandler<T> {
  abstract validate(payload: T): Promise<void>;
  abstract execute(db: Database, payload: T): Promise<any>;
}
```

### Step 5.2: Create User Handler

Create `src/handlers/create-user.handler.ts`:

```typescript
import { eq } from 'drizzle-orm';
import { type Database } from '../db/index.js';
import { users } from '../db/schema/index.js';
import { type CreateUserPayload } from '../types/workflow.type.js';
import { BaseActionHandler } from './base.handler.js';
import { createUserSchema } from '../validators/workflow.validator.js';

export class CreateUserHandler extends BaseActionHandler<CreateUserPayload> {
  async validate(payload: CreateUserPayload): Promise<void> {
    // Validate with Zod schema
    const validationResult = createUserSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }
  }

  async execute(db: Database, payload: CreateUserPayload): Promise<any> {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, payload.email),
    });

    if (existingUser) {
      throw new Error(`User with email ${payload.email} already exists`);
    }

    // Check if username is taken
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, payload.username),
    });

    if (existingUsername) {
      throw new Error(`Username ${payload.username} is already taken`);
    }

    // Insert the new user
    const [newUser] = await db.insert(users).values({
      email: payload.email,
      username: payload.username,
      fullName: payload.fullName,
      password: "$2b$10$4cXn4kdl6v36ARMmUZ0nvOCBGGUKtWk5X.lZRsXWLn/GgQFqaTGRe" // Default hashed password
    }).returning();

    return newUser;
  }
}
```

### Step 5.3: Create Account Handler

Create `src/handlers/create-account.handler.ts`:

```typescript
import { eq } from 'drizzle-orm';
import { type Database } from '../db/index.js';
import { accounts, users } from '../db/schema/index.js';
import { type CreateAccountPayload } from '../types/workflow.type.js';
import { BaseActionHandler } from './base.handler.js';
import { createAccountSchema } from '../validators/workflow.validator.js';

export class CreateAccountHandler extends BaseActionHandler<CreateAccountPayload> {
  async validate(payload: CreateAccountPayload): Promise<void> {
    const validationResult = createAccountSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }
  }

  async execute(db: Database, payload: CreateAccountPayload): Promise<any> {
    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      throw new Error(`User with ID ${payload.userId} not found`);
    }

    // Check if account number already exists
    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.accountNumber, payload.accountNumber),
    });

    if (existingAccount) {
      throw new Error(`Account number ${payload.accountNumber} already exists`);
    }

    // Create the account
    const [newAccount] = await db.insert(accounts).values({
      userId: payload.userId,
      accountNumber: payload.accountNumber,
      accountType: payload.accountType,
      balance: payload.balance,
      currency: payload.currency,
    }).returning();

    return newAccount;
  }
}
```

### Step 5.4: Create Promotion Handler

Create `src/handlers/create-promotion.handler.ts`:

```typescript
import { eq } from 'drizzle-orm';
import { type Database } from '../db/index.js';
import { promotions } from '../db/schema/index.js';
import { type CreatePromotionPayload } from '../types/workflow.type.js';
import { BaseActionHandler } from './base.handler.js';
import { createPromotionSchema } from '../validators/workflow.validator.js';

export class CreatePromotionHandler extends BaseActionHandler<CreatePromotionPayload> {
  async validate(payload: CreatePromotionPayload): Promise<void> {
    const validationResult = createPromotionSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }
  }

  async execute(db: Database, payload: CreatePromotionPayload): Promise<any> {
    // Check if promotion code already exists
    const existingPromotion = await db.query.promotions.findFirst({
      where: eq(promotions.code, payload.code),
    });

    if (existingPromotion) {
      throw new Error(`Promotion code ${payload.code} already exists`);
    }

    // Create the promotion
    const [newPromotion] = await db.insert(promotions).values({
      code: payload.code,
      name: payload.name,
      description: payload.description,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
    }).returning();

    return newPromotion;
  }
}
```

### Step 5.5: Create Action Handler Factory

Create `src/handlers/action-handler.factory.ts`:

```typescript
import { ActionTypes } from '../types/workflow.type.js';
import { type ActionHandler } from './base.handler.js';
import { CreateUserHandler } from './create-user.handler.js';
import { CreateAccountHandler } from './create-account.handler.js';
import { CreatePromotionHandler } from './create-promotion.handler.js';

export class ActionHandlerFactory {
  private static handlers: Record<string, ActionHandler<any>> = {
    [ActionTypes.CREATE_USER]: new CreateUserHandler(),
    [ActionTypes.CREATE_ACCOUNT]: new CreateAccountHandler(),
    [ActionTypes.CREATE_PROMOTION]: new CreatePromotionHandler(),
  };

  static getHandler(actionType: string): ActionHandler<any> {
    const handler = this.handlers[actionType];
    
    if (!handler) {
      throw new Error(`No handler found for action type: ${actionType}`);
    }

    return handler;
  }

  static registerHandler(actionType: string, handler: ActionHandler<any>): void {
    this.handlers[actionType] = handler;
  }

  static getAllActionTypes(): string[] {
    return Object.keys(this.handlers);
  }
}
```

**Why Factory Pattern?**
- ✅ Easy to add new action types without modifying existing code
- ✅ Each handler is independent and testable
- ✅ Follows Open/Closed Principle (open for extension, closed for modification)

---

## Part 6: Business Logic Layer (Service)

Create `src/services/workflow.service.ts`:

```typescript
import { eq, and, desc } from 'drizzle-orm';
import { type Database, db } from '../db/index.js';
import { workflowActions } from '../db/schema/index.js';
import { ActionStatus, type ActionStatusType } from '../types/workflow.type.js';
import { ActionHandlerFactory } from '../handlers/action-handler.factory.js';

export class WorkflowService {
  private db: Database;

  constructor(database?: Database) {
    this.db = database || db;
  }

  async createAction(actionType: string, payload: any, makerId: string) {
    // Get the appropriate handler
    const handler = ActionHandlerFactory.getHandler(actionType);

    // Validate the payload
    await handler.validate(payload);

    // Create workflow action record
    const [action] = await this.db.insert(workflowActions).values({
      actionType,
      payload,
      makerId,
      status: ActionStatus.PENDING,
    }).returning();

    return action;
  }

  async listActions(filters?: {
    status?: ActionStatusType;
    actionType?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, actionType, page = 1, limit = 10 } = filters || {};
    const offset = (page - 1) * limit;

    let query = this.db.query.workflowActions.findMany({
      orderBy: [desc(workflowActions.createdAt)],
      limit,
      offset,
    });

    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(workflowActions.status, status));
    }
    if (actionType) {
      conditions.push(eq(workflowActions.actionType, actionType));
    }

    if (conditions.length > 0) {
      query = this.db.query.workflowActions.findMany({
        where: and(...conditions),
        orderBy: [desc(workflowActions.createdAt)],
        limit,
        offset,
      });
    }

    const actions = await query;

    // Get total count for pagination
    const totalQuery = conditions.length > 0
      ? this.db.select().from(workflowActions).where(and(...conditions))
      : this.db.select().from(workflowActions);
    
    const totalResult = await totalQuery;
    const total = totalResult.length;

    return {
      data: actions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActionById(actionId: string) {
    const action = await this.db.query.workflowActions.findFirst({
      where: eq(workflowActions.id, actionId),
    });

    if (!action) {
      throw new Error(`Action with ID ${actionId} not found`);
    }

    return action;
  }

  async reviewAction(actionId: string, checkerId: string, status: ActionStatusType, reviewComment?: string) {
    // Get the action
    const action = await this.getActionById(actionId);

    // Check if action is already reviewed
    if (action.status !== ActionStatus.PENDING) {
      throw new Error(`Action is already ${action.status} and cannot be reviewed again`);
    }

    // Maker cannot be the checker
    if (action.makerId === checkerId) {
      throw new Error('Maker cannot review their own action');
    }

    // Update the action status
    const [updatedAction] = await this.db
      .update(workflowActions)
      .set({
        status,
        checkerId,
        reviewComment,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workflowActions.id, actionId))
      .returning();

    // If approved, execute the action
    if (status === ActionStatus.APPROVED) {
      const handler = ActionHandlerFactory.getHandler(action.actionType);
      const result = await handler.execute(this.db, action.payload);
      
      return {
        action: updatedAction,
        executionResult: result,
      };
    }

    return {
      action: updatedAction,
    };
  }
}
```

**Key Business Rules Implemented:**
1. ✅ Maker cannot review their own action
2. ✅ Actions can only be reviewed once
3. ✅ Approved actions are automatically executed
4. ✅ All payloads are validated before creation

---

## Part 7: Controllers and Routes

### Step 7.1: Create Workflow Controller

Create `src/controllers/workflow.controller.ts`:

```typescript
import { Context } from 'hono';
import { WorkflowService } from '../services/workflow.service.js';
import { createWorkflowActionSchema, reviewActionSchema } from '../validators/workflow.validator.js';

const workflowService = new WorkflowService();

export class WorkflowController {
  async createAction(c: Context) {
    try {
      const body = await c.req.json();
      
      // Validate request body
      const validationResult = createWorkflowActionSchema.safeParse(body);
      if (!validationResult.success) {
        return c.json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        }, 400);
      }

      const { actionType, payload, makerId } = validationResult.data;

      const action = await workflowService.createAction(actionType, payload, makerId);

      return c.json({
        success: true,
        message: 'Workflow action created successfully',
        data: action,
      }, 201);
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message,
      }, 400);
    }
  }

  async listActions(c: Context) {
    try {
      const status = c.req.query('status');
      const actionType = c.req.query('actionType');
      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');

      const result = await workflowService.listActions({
        status: status as any,
        actionType,
        page,
        limit,
      });

      return c.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message,
      }, 400);
    }
  }

  async getActionById(c: Context) {
    try {
      const actionId = c.req.param('id');
      const action = await workflowService.getActionById(actionId);

      return c.json({
        success: true,
        data: action,
      });
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message,
      }, 404);
    }
  }

  async reviewAction(c: Context) {
    try {
      const actionId = c.req.param('id');
      const body = await c.req.json();

      // Validate request body
      const validationResult = reviewActionSchema.safeParse(body);
      if (!validationResult.success) {
        return c.json({
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        }, 400);
      }

      const { status, checkerId, reviewComment } = validationResult.data;

      const result = await workflowService.reviewAction(
        actionId,
        checkerId,
        status as any,
        reviewComment
      );

      const message = status === 'approved' 
        ? 'Action approved and executed successfully'
        : 'Action rejected';

      return c.json({
        success: true,
        message,
        data: result,
      });
    } catch (error: any) {
      return c.json({
        success: false,
        error: error.message,
      }, 400);
    }
  }
}
```

### Step 7.2: Create Routes

Create `src/routes/workflow.route.ts`:

```typescript
import { Hono } from 'hono';
import { WorkflowController } from '../controllers/workflow.controller.js';

const workflow = new Hono();
const controller = new WorkflowController();

// Create new workflow action
workflow.post('/actions', (c) => controller.createAction(c));

// List all workflow actions with filters
workflow.get('/actions', (c) => controller.listActions(c));

// Get specific action by ID
workflow.get('/actions/:id', (c) => controller.getActionById(c));

// Review action (approve/reject)
workflow.post('/actions/:id/review', (c) => controller.reviewAction(c));

export default workflow;
```

---

## Part 8: Main Application Entry Point

Create `src/config.ts`:

```typescript
import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 8080,
  databaseUrl: process.env.DATABASE_URL!,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
};
```

Create `src/index.ts`:

```typescript
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import workflowRoutes from './routes/workflow.route.js';
import { runMigrations } from './db/migrate.js';

const app = new Hono();

// Run migrations on startup
await runMigrations();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/workflow', workflowRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Route not found',
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    {
      success: false,
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

const port = Number(process.env.PORT) || 8080;

console.log(`🚀 Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
```

---

## Part 9: Testing the Application

### Step 9.1: Start the Development Server

```bash
# Make sure PostgreSQL is running
sudo systemctl status postgresql

# Start the development server
pnpm dev
```

You should see:
```
⏳ Running migrations...
✅ Migrations completed!
🚀 Server starting on port 8080
```

### Step 9.2: Test with cURL

**1. Create a User Action:**

```bash
curl -X POST http://localhost:8080/api/workflow/actions \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "create_user",
    "makerId": "maker123",
    "payload": {
      "email": "john.doe@example.com",
      "username": "johndoe",
      "fullName": "John Doe"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Workflow action created successfully",
  "data": {
    "id": "uuid-here",
    "actionType": "create_user",
    "status": "pending",
    "payload": {...},
    "makerId": "maker123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**2. List Pending Actions:**

```bash
curl http://localhost:8080/api/workflow/actions?status=pending
```

**3. Get Action Details:**

```bash
# Replace {action-id} with the actual ID from step 1
curl http://localhost:8080/api/workflow/actions/{action-id}
```

**4. Approve the Action:**

```bash
curl -X POST http://localhost:8080/api/workflow/actions/{action-id}/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "checkerId": "checker456",
    "reviewComment": "Looks good, approved!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Action approved and executed successfully",
  "data": {
    "action": {
      "id": "uuid",
      "status": "approved",
      "checkerId": "checker456",
      "reviewedAt": "2024-01-01T00:00:00Z"
    },
    "executionResult": {
      "id": "user-uuid",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "fullName": "John Doe"
    }
  }
}
```

**5. Verify User was Created:**

```bash
# Connect to PostgreSQL
psql -U postgres -d workflow

# Query users table
SELECT * FROM users;
```

---

## Part 10: Architecture Diagram

Here's how all the components work together:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Request                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Hono Routes Layer                       │
│              (workflow.route.ts)                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Controller Layer                         │
│          (workflow.controller.ts)                        │
│          - Request validation (Zod)                      │
│          - Response formatting                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Service Layer                            │
│          (workflow.service.ts)                           │
│          - Business logic                                │
│          - Maker-Checker rules                           │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│ Factory Pattern  │   │  Database Layer  │
│   (Handlers)     │   │   (Drizzle ORM)  │
│                  │   │                  │
│ - CreateUser     │   │  - Users         │
│ - CreateAccount  │   │  - Accounts      │
│ - CreatePromotion│   │  - Promotions    │
│                  │   │  - Workflow      │
└──────────────────┘   └──────────────────┘
```

---

## Conclusion

Congratulations! 🎉 You've built a prototype Maker-Checker workflow system from scratch. Here's what you've accomplished:

✅ **Clean Architecture** - Separated concerns across layers  
✅ **Type Safety** - Full TypeScript coverage with Drizzle ORM  
✅ **Extensibility** - Factory Pattern makes adding new actions trivial  
✅ **Validation** - Zod schemas ensure data integrity  
✅ **Business Rules** - Maker-Checker pattern properly implemented  
✅ **Database Migrations** - Version-controlled schema changes  

### Next Steps

1. **Add Authentication** - Implement JWT-based auth with role-based access control
2. **Add Tests** - Write unit and integration tests
3. **Add Logging** - Implement structured logging with Winston or Pino
4. **Dockerize** - Create Dockerfile for containerization
5. **Deploy to Kubernetes** - Set up production infrastructure

### Key Takeaways

- **Factory Pattern** is perfect for extensible systems
- **Drizzle ORM** provides excellent type safety
- **Zod** makes runtime validation simple and type-safe
- **Layered architecture** keeps code maintainable

---

**Found this helpful?** Drop a ⭐ and let me know what you'd like to see next!

#TypeScript #NodeJS #Backend #SoftwareArchitecture #CleanCode #PostgreSQL #WebDevelopment #FactoryPattern #MakerChecker #Tutorial
