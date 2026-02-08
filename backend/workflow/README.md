# Workflow System with Maker-Checker Process

A scalable and maintainable Hono backend implementing a workflow system with maker-checker approval process. Built with TypeScript, Drizzle ORM, and PostgreSQL.

## 🏗️ Architecture

This project follows a **layered architecture** with clear separation of concerns:

```
src/
├── controllers/       # HTTP request handlers
├── services/          # Business logic layer
├── handlers/          # Action-specific handlers (Factory Pattern)
├── routes/            # API route definitions
├── db/
│   └── schema/       # Database schema definitions
├── types/            # TypeScript type definitions
├── validators/       # Input validation schemas (Zod)
└── index.ts          # Application entry point
```

## ✨ Features

- **Maker-Checker Process**: Two-person rule for critical operations
- **Factory Pattern**: Extensible action handler system
- **Type Safety**: Full TypeScript implementation
- **Input Validation**: Zod schemas for request validation
- **Database ORM**: Drizzle ORM with PostgreSQL
- **RESTful API**: Clean and consistent API design
- **Pagination**: Built-in pagination support
- **Error Handling**: Comprehensive error handling

## 📋 Supported Actions

1. **Create User** (`create_user`)
2. **Create Account** (`create_account`)
3. **Create Promotion** (`create_promotion`)

Each action follows the maker-checker workflow:
1. Maker creates the action (status: `pending`)
2. Checker reviews and approves/rejects
3. On approval, the action is automatically executed

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hono-workflow-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Generate and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:8080`

## 📡 API Endpoints

### 1. Create Workflow Action
**POST** `/api/workflow/actions`

Creates a new workflow action that requires approval.

**Request Body:**
```json
{
  "actionType": "create_user",
  "makerId": "maker123",
  "payload": {
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow action created successfully",
  "data": {
    "id": "uuid",
    "actionType": "create_user",
    "status": "pending",
    "payload": {...},
    "makerId": "maker123",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. List Workflow Actions
**GET** `/api/workflow/actions`

Retrieves a paginated list of workflow actions with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `approved`, `rejected`)
- `actionType` (optional): Filter by action type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/workflow/actions?status=pending&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 3. Get Action Detail
**GET** `/api/workflow/actions/:id`

Retrieves detailed information about a specific workflow action.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "actionType": "create_user",
    "status": "pending",
    "payload": {...},
    "makerId": "maker123",
    "checkerId": null,
    "reviewComment": null,
    "reviewedAt": null,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4. Review Action
**POST** `/api/workflow/actions/:id/review`

Approves or rejects a pending workflow action. On approval, the action is automatically executed.

**Request Body:**
```json
{
  "status": "approved",
  "checkerId": "checker456",
  "reviewComment": "Looks good!"
}
```

**Response (Approved):**
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
      "email": "user@example.com",
      "username": "johndoe"
    }
  }
}
```

## 📝 Action Payloads

### Create User
```json
{
  "actionType": "create_user",
  "makerId": "maker123",
  "payload": {
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe"
  }
}
```

### Create Account
```json
{
  "actionType": "create_account",
  "makerId": "maker123",
  "payload": {
    "userId": "user-uuid",
    "accountNumber": "ACC123456",
    "accountType": "savings",
    "balance": "1000.00",
    "currency": "USD"
  }
}
```

### Create Promotion
```json
{
  "actionType": "create_promotion",
  "makerId": "maker123",
  "payload": {
    "code": "SUMMER2024",
    "name": "Summer Sale",
    "description": "Get 20% off!",
    "discountType": "percentage",
    "discountValue": "20.00",
    "startDate": "2024-06-01T00:00:00Z",
    "endDate": "2024-08-31T23:59:59Z"
  }
}
```

## 🏭 Adding New Actions

The Factory Pattern makes it easy to add new action types:

### Step 1: Define the Action Type
```typescript
// src/types/workflow.types.ts
export const ActionTypes = {
  CREATE_USER: 'create_user',
  CREATE_ACCOUNT: 'create_account',
  CREATE_PROMOTION: 'create_promotion',
  CREATE_PRODUCT: 'create_product', // New action
} as const;

export interface CreateProductPayload extends BaseActionPayload {
  actionType: typeof ActionTypes.CREATE_PRODUCT;
  name: string;
  price: string;
  // ... other fields
}
```

### Step 2: Create Validation Schema
```typescript
// src/validators/workflow.validator.ts
export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  // ... other validations
});
```

### Step 3: Create Handler
```typescript
// src/handlers/create-product.handler.ts
export class CreateProductHandler extends BaseActionHandler<CreateProductPayload> {
  async validate(payload: CreateProductPayload): Promise<void> {
    const validationResult = createProductSchema.safeParse(payload);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }
  }

  async execute(db: Database, payload: CreateProductPayload): Promise<any> {
    // Insert product into database
    const [newProduct] = await db.insert(products).values({
      name: payload.name,
      price: payload.price,
    }).returning();

    return newProduct;
  }
}
```

### Step 4: Register in Factory
```typescript
// src/handlers/action-handler.factory.ts
private static handlers: Map<string, ActionHandler> = new Map([
  [ActionTypes.CREATE_USER, new CreateUserHandler()],
  [ActionTypes.CREATE_ACCOUNT, new CreateAccountHandler()],
  [ActionTypes.CREATE_PROMOTION, new CreatePromotionHandler()],
  [ActionTypes.CREATE_PRODUCT, new CreateProductHandler()], // New handler
]);
```

That's it! Your new action type is now fully integrated.

## 🔒 Business Rules

1. **Maker-Checker Separation**: A maker cannot review their own action
2. **Single Review**: Once an action is reviewed, it cannot be reviewed again
3. **Automatic Execution**: Approved actions are immediately executed
4. **Validation**: All payloads are validated before action creation
5. **Duplicate Prevention**: Handlers check for existing records (emails, account numbers, etc.)

## 🗄️ Database Schema

### workflow_actions
- `id`: UUID (Primary Key)
- `action_type`: varchar(100) - Type of action
- `status`: varchar(20) - pending/approved/rejected
- `payload`: jsonb - Action data
- `maker_id`: varchar(255) - User who created
- `checker_id`: varchar(255) - User who reviewed
- `review_comment`: text - Review notes
- `reviewed_at`: timestamp - Review timestamp
- `created_at`: timestamp
- `updated_at`: timestamp

### users
- `id`: UUID (Primary Key)
- `email`: varchar(255) - Unique
- `username`: varchar(100)
- `full_name`: varchar(255)
- `is_active`: boolean
- `created_at`: timestamp
- `updated_at`: timestamp

### accounts
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users)
- `account_number`: varchar(50) - Unique
- `account_type`: varchar(50)
- `balance`: decimal(15,2)
- `currency`: varchar(3)
- `created_at`: timestamp
- `updated_at`: timestamp

### promotions
- `id`: UUID (Primary Key)
- `code`: varchar(50) - Unique
- `name`: varchar(255)
- `description`: text
- `discount_type`: varchar(20) - percentage/fixed
- `discount_value`: decimal(10,2)
- `is_active`: boolean
- `start_date`: timestamp
- `end_date`: timestamp
- `created_at`: timestamp
- `updated_at`: timestamp

## 🧪 Example Usage Flow

```bash
# 1. Maker creates a user action
curl -X POST http://localhost:8080/api/workflow/actions \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "create_user",
    "makerId": "maker123",
    "payload": {
      "email": "john@example.com",
      "username": "johndoe",
      "fullName": "John Doe"
    }
  }'

# 2. List pending actions
curl http://localhost:8080/api/workflow/actions?status=pending

# 3. Get action detail
curl http://localhost:8080/api/workflow/actions/{action-id}

# 4. Checker approves the action
curl -X POST http://localhost:8080/api/workflow/actions/{action-id}/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "checkerId": "checker456",
    "reviewComment": "Verified and approved"
  }'
```

## 🛠️ Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## 📦 Project Structure Benefits

1. **Scalability**: Easy to add new action types via Factory Pattern
2. **Maintainability**: Clear separation of concerns
3. **Type Safety**: Full TypeScript coverage
4. **Testability**: Each layer can be tested independently
5. **Extensibility**: Simple to add new features
6. **Clean Code**: Follows SOLID principles

## 🔐 Security Considerations

- Implement authentication middleware
- Add authorization checks (maker/checker roles)
- Rate limiting on API endpoints
- Input sanitization
- SQL injection prevention (handled by Drizzle ORM)
- Audit logging for all actions

## 📚 Technologies Used

- **Hono**: Fast, lightweight web framework
- **Drizzle ORM**: Type-safe ORM for PostgreSQL
- **Zod**: TypeScript-first schema validation
- **PostgreSQL**: Reliable relational database
- **TypeScript**: Type-safe development

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

Built with ❤️ using Hono and TypeScript