# Quick Start Guide

Get your workflow system up and running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- pnpm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```sql
CREATE DATABASE workflow_db;
```

### 3. Configure Environment

Copy the example environment file and update it with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/workflow_db
PORT=3000
NODE_ENV=development
```

### 4. Run Database Migrations

Generate and apply migrations:

```bash
pnpm run db:generate
pnpm run db:migrate
```

### 5. Start the Server

```bash
pnpm run dev
```

The server should now be running at `http://localhost:3000`

## Verify Installation

Test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-29T10:30:00.000Z"
}
```

## First Workflow Test

### 1. Create a user action (Maker)

```bash
curl -X POST http://localhost:3000/api/workflow/actions \
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
```

Save the `id` from the response.

### 2. View pending actions

```bash
curl "http://localhost:3000/api/workflow/actions?status=pending"
```

### 3. Approve the action (Checker)

Replace `{ACTION_ID}` with the ID from step 1:

```bash
curl -X POST http://localhost:3000/api/workflow/actions/{ACTION_ID}/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "checkerId": "checker456",
    "reviewComment": "Approved"
  }'
```

The user should now be created in the database!

## Explore the Database

Use Drizzle Studio to view your data:

```bash
pnpm run db:studio
```

This will open a web interface at `http://localhost:4983`

## Next Steps

- Read the [README.md](README.md) for comprehensive documentation
- Check [API_EXAMPLES.md](API_EXAMPLES.md) for more API examples
- Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) to understand the architecture
- Add new action types following the Factory Pattern

## Common Issues

### Port already in use
Change the `PORT` in `.env` to a different value.

### Database connection error
- Verify PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- Ensure the database exists

### Migration errors
```bash
# Reset and regenerate migrations
rm -rf drizzle/
pnpm run db:generate
pnpm run db:migrate
```

## Development Workflow

```bash
# Run in development mode with hot reload
pnpm run dev

# Build for production
pnpm run build

# Run production build
pnpm start

# View database
pnpm run db:studio
```

## Support

For issues or questions, please refer to the full documentation in README.md.

---

Happy coding! 🚀