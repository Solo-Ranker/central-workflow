# Project Structure

```
hono-workflow-system/
│
├── src/
│   ├── controllers/              # HTTP Request Handlers
│   │   └── workflow.controller.ts
│   │
│   ├── services/                 # Business Logic Layer
│   │   └── workflow.service.ts
│   │
│   ├── handlers/                 # Action Handlers (Factory Pattern)
│   │   ├── base.handler.ts
│   │   ├── create-user.handler.ts
│   │   ├── create-account.handler.ts
│   │   ├── create-promotion.handler.ts
│   │   └── action-handler.factory.ts
│   │
│   ├── routes/                   # API Routes
│   │   └── workflow.routes.ts
│   │
│   ├── db/                       # Database Layer
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── accounts.ts
│   │   │   ├── promotions.ts
│   │   │   ├── workflow-actions.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── types/                    # Type Definitions
│   │   └── workflow.types.ts
│   │
│   ├── validators/               # Input Validation
│   │   └── workflow.validator.ts
│   │
│   └── index.ts                  # Application Entry Point
│
├── drizzle/                      # Generated Migrations
├── .env.example                  # Environment Template
├── .gitignore
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── README.md

```

## Layer Responsibilities

### 1. Controllers Layer
- Handle HTTP requests and responses
- Parse request data
- Validate input using validators
- Call service layer methods
- Format responses
- Error handling

**Example:** `workflow.controller.ts`

### 2. Services Layer
- Contain business logic
- Orchestrate operations across multiple handlers
- Manage transactions
- Implement workflow rules (maker-checker logic)
- Data access through repositories/ORM

**Example:** `workflow.service.ts`

### 3. Handlers Layer (Factory Pattern)
- Implement specific action logic
- Validate action-specific business rules
- Execute database operations for actions
- Extend base handler interface
- Registered in factory for dynamic instantiation

**Example:** `create-user.handler.ts`, `create-account.handler.ts`

### 4. Routes Layer
- Define API endpoints
- Map URLs to controller methods
- Group related endpoints
- Apply middleware

**Example:** `workflow.routes.ts`

### 5. Database Layer
- Define database schema
- Manage database connections
- Provide type-safe database access

**Example:** `schema/users.ts`, `schema/workflow-actions.ts`

### 6. Types Layer
- Define TypeScript interfaces and types
- Ensure type safety across the application
- Define constants and enums

**Example:** `workflow.types.ts`

### 7. Validators Layer
- Define Zod schemas for input validation
- Validate request payloads
- Ensure data integrity

**Example:** `workflow.validator.ts`

## Design Patterns Used

### 1. Factory Pattern
**Location:** `handlers/action-handler.factory.ts`

**Purpose:** Create handler instances dynamically based on action type

**Benefits:**
- Easy to add new action types
- Centralized handler management
- Loose coupling between components

### 2. Strategy Pattern
**Location:** Handler implementations

**Purpose:** Define a family of algorithms (handlers), encapsulate each one, and make them interchangeable

**Benefits:**
- Different actions can have different execution logic
- Easy to test individual handlers
- Adheres to Open/Closed Principle

### 3. Layered Architecture
**Location:** Entire project structure

**Purpose:** Separate concerns into distinct layers

**Benefits:**
- Clear separation of responsibilities
- Easy to maintain and test
- Scalable architecture

## Data Flow

```
HTTP Request
    ↓
Route Handler (routes/)
    ↓
Controller (controllers/)
    ↓
Validator (validators/)
    ↓
Service (services/)
    ↓
Factory (handlers/factory)
    ↓
Handler (handlers/)
    ↓
Database (db/)
    ↓
Response
```

## Adding New Features

### Adding a New Action Type

1. **Define Type** (`types/workflow.types.ts`)
   ```typescript
   export const ActionTypes = {
     // ... existing
     CREATE_PRODUCT: 'create_product',
   };
   ```

2. **Create Schema** (`validators/workflow.validator.ts`)
   ```typescript
   export const createProductSchema = z.object({
     // validation rules
   });
   ```

3. **Create Handler** (`handlers/create-product.handler.ts`)
   ```typescript
   export class CreateProductHandler extends BaseActionHandler {
     // implementation
   }
   ```

4. **Register in Factory** (`handlers/action-handler.factory.ts`)
   ```typescript
   [ActionTypes.CREATE_PRODUCT, new CreateProductHandler()]
   ```

### Adding a New Endpoint

1. **Add Method to Controller** (`controllers/workflow.controller.ts`)
2. **Define Route** (`routes/workflow.routes.ts`)
3. **Add Validation** (`validators/workflow.validator.ts`)

## Best Practices Implemented

1. **Single Responsibility Principle**: Each class has one reason to change
2. **Open/Closed Principle**: Open for extension, closed for modification
3. **Dependency Inversion**: Depend on abstractions, not concretions
4. **Type Safety**: Full TypeScript coverage
5. **Input Validation**: Validate all inputs using Zod
6. **Error Handling**: Comprehensive error handling at each layer
7. **Separation of Concerns**: Clear boundaries between layers

## Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (development/production)

## Database Migrations

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database GUI
npm run db:studio
```