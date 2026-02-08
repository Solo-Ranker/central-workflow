# API Testing Examples

This document provides example curl commands and Postman-style requests for testing the workflow API.

## Base URL
```
http://localhost:8080
```

## 1. Health Check

### Request
```bash
curl -X GET http://localhost:8080/health
```

### Response
```json
{
  "status": "ok",
  "timestamp": "2024-01-29T10:30:00.000Z"
}
```

---

## 2. Create Workflow Actions

### Create User Action

```bash
curl -X POST http://localhost:8080/api/workflow/actions \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "create_user",
    "makerId": "maker_user_001",
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
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "actionType": "create_user",
    "status": "pending",
    "payload": {
      "email": "john.doe@example.com",
      "username": "johndoe",
      "fullName": "John Doe"
    },
    "makerId": "maker_user_001",
    "checkerId": null,
    "reviewComment": null,
    "reviewedAt": null,
    "createdAt": "2024-01-29T10:30:00.000Z",
    "updatedAt": "2024-01-29T10:30:00.000Z"
  }
}
```

### Create Account Action

```bash
curl -X POST http://localhost:8080/api/workflow/actions \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "create_account",
    "makerId": "maker_user_002",
    "payload": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "accountNumber": "ACC20240001",
      "accountType": "savings",
      "balance": "1000.00",
      "currency": "USD"
    }
  }'
```

### Create Promotion Action

```bash
curl -X POST http://localhost:8080/api/workflow/actions \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "create_promotion",
    "makerId": "maker_user_003",
    "payload": {
      "code": "SUMMER2024",
      "name": "Summer Sale 2024",
      "description": "Get 20% off on all products this summer!",
      "discountType": "percentage",
      "discountValue": "20.00",
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T23:59:59.999Z"
    }
  }'
```

---

## 3. List Workflow Actions

### List All Actions (with pagination)

```bash
curl -X GET "http://localhost:8080/api/workflow/actions?page=1&limit=10"
```

### Filter by Status - Pending Actions

```bash
curl -X GET "http://localhost:8080/api/workflow/actions?status=pending&page=1&limit=10"
```

### Filter by Status - Approved Actions

```bash
curl -X GET "http://localhost:8080/api/workflow/actions?status=approved&page=1&limit=10"
```

### Filter by Action Type - User Creation Actions

```bash
curl -X GET "http://localhost:8080/api/workflow/actions?actionType=create_user&page=1&limit=10"
```

### Multiple Filters - Pending User Creation Actions

```bash
curl -X GET "http://localhost:8080/api/workflow/actions?status=pending&actionType=create_user&page=1&limit=10"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "actionType": "create_user",
      "status": "pending",
      "payload": {...},
      "makerId": "maker_user_001",
      "checkerId": null,
      "reviewComment": null,
      "reviewedAt": null,
      "createdAt": "2024-01-29T10:30:00.000Z",
      "updatedAt": "2024-01-29T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

## 4. Get Action Detail

```bash
curl -X GET http://localhost:8080/api/workflow/actions/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "actionType": "create_user",
    "status": "pending",
    "payload": {
      "email": "john.doe@example.com",
      "username": "johndoe",
      "fullName": "John Doe"
    },
    "makerId": "maker_user_001",
    "checkerId": null,
    "reviewComment": null,
    "reviewedAt": null,
    "createdAt": "2024-01-29T10:30:00.000Z",
    "updatedAt": "2024-01-29T10:30:00.000Z"
  }
}
```

---

## 5. Review Workflow Actions

### Approve Action

```bash
curl -X POST http://localhost:8080/api/workflow/actions/550e8400-e29b-41d4-a716-446655440000/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "checkerId": "checker_user_001",
    "reviewComment": "All details verified. Approved for creation."
  }'
```

**Expected Response (Successful Approval):**
```json
{
  "success": true,
  "message": "Action approved and executed successfully",
  "data": {
    "action": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "actionType": "create_user",
      "status": "approved",
      "payload": {...},
      "makerId": "maker_user_001",
      "checkerId": "checker_user_001",
      "reviewComment": "All details verified. Approved for creation.",
      "reviewedAt": "2024-01-29T11:00:00.000Z",
      "createdAt": "2024-01-29T10:30:00.000Z",
      "updatedAt": "2024-01-29T11:00:00.000Z"
    },
    "executionResult": {
      "id": "660e8400-e29b-41d4-a716-446655440011",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "isActive": true,
      "createdAt": "2024-01-29T11:00:00.000Z",
      "updatedAt": "2024-01-29T11:00:00.000Z"
    }
  }
}
```

### Reject Action

```bash
curl -X POST http://localhost:8080/api/workflow/actions/550e8400-e29b-41d4-a716-446655440001/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "checkerId": "checker_user_001",
    "reviewComment": "Email domain not allowed. Please use company email."
  }'
```

**Expected Response (Rejection):**
```json
{
  "success": true,
  "message": "Action rejected successfully",
  "data": {
    "action": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "actionType": "create_user",
      "status": "rejected",
      "payload": {...},
      "makerId": "maker_user_001",
      "checkerId": "checker_user_001",
      "reviewComment": "Email domain not allowed. Please use company email.",
      "reviewedAt": "2024-01-29T11:00:00.000Z",
      "createdAt": "2024-01-29T10:30:00.000Z",
      "updatedAt": "2024-01-29T11:00:00.000Z"
    }
  }
}
```

---

## Error Scenarios

### Invalid Email Format

```bash
curl -X POST http://localhost:8080/api/workflow/actions \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "create_user",
    "makerId": "maker_user_001",
    "payload": {
      "email": "invalid-email",
      "username": "johndoe",
      "fullName": "John Doe"
    }
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_string",
      "message": "Invalid email format",
      "path": ["email"]
    }
  ]
}
```

### Maker Reviews Own Action

```bash
curl -X POST http://localhost:8080/api/workflow/actions/550e8400-e29b-41d4-a716-446655440000/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "checkerId": "maker_user_001",
    "reviewComment": "Approving my own action"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Maker cannot review their own action"
}
```

### Action Already Reviewed

```bash
curl -X POST http://localhost:8080/api/workflow/actions/550e8400-e29b-41d4-a716-446655440000/review \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "checkerId": "checker_user_002",
    "reviewComment": "Second approval attempt"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": "Action is already approved and cannot be reviewed again"
}
```

### Action Not Found

```bash
curl -X GET http://localhost:8080/api/workflow/actions/non-existent-id
```

**Response:**
```json
{
  "success": false,
  "error": "Action with ID non-existent-id not found"
}
```

---

## Complete Workflow Example

### Step 1: Maker creates a user action
```bash
ACTION_RESPONSE=$(curl -s -X POST http://localhost:8080/api/workflow/actions \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "create_user",
    "makerId": "maker123",
    "payload": {
      "email": "alice@example.com",
      "username": "alice",
      "fullName": "Alice Smith"
    }
  }')

ACTION_ID=$(echo $ACTION_RESPONSE | jq -r '.data.id')
echo "Created action: $ACTION_ID"
```

### Step 2: List pending actions
```bash
curl -X GET "http://localhost:8080/api/workflow/actions?status=pending"
```

### Step 3: Get action details
```bash
curl -X GET "http://localhost:8080/api/workflow/actions/$ACTION_ID"
```

### Step 4: Checker approves the action
```bash
curl -X POST "http://localhost:8080/api/workflow/actions/$ACTION_ID/review" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "checkerId": "checker456",
    "reviewComment": "User details verified and approved"
  }'
```

### Step 5: Verify action status
```bash
curl -X GET "http://localhost:8080/api/workflow/actions/$ACTION_ID"
```

---

## Postman Collection

You can import this JSON into Postman to test the API:

```json
{
  "info": {
    "name": "Workflow API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create User Action",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"actionType\": \"create_user\",\n  \"makerId\": \"maker123\",\n  \"payload\": {\n    \"email\": \"test@example.com\",\n    \"username\": \"testuser\",\n    \"fullName\": \"Test User\"\n  }\n}"
        },
        "url": "http://localhost:8080/api/workflow/actions"
      }
    },
    {
      "name": "List Actions",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/workflow/actions?status=pending&page=1&limit=10"
      }
    },
    {
      "name": "Get Action Detail",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/api/workflow/actions/{{actionId}}"
      }
    },
    {
      "name": "Approve Action",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"status\": \"approved\",\n  \"checkerId\": \"checker456\",\n  \"reviewComment\": \"Approved\"\n}"
        },
        "url": "http://localhost:8080/api/workflow/actions/{{actionId}}/review"
      }
    }
  ]
}
```

---

## Testing with HTTPie

If you prefer HTTPie over curl:

```bash
# Create action
http POST localhost:8080/api/workflow/actions \
  actionType=create_user \
  makerId=maker123 \
  payload:='{"email":"test@example.com","username":"testuser","fullName":"Test User"}'

# List actions
http GET localhost:8080/api/workflow/actions status==pending page==1 limit==10

# Approve action
http POST localhost:8080/api/workflow/actions/{action-id}/review \
  status=approved \
  checkerId=checker456 \
  reviewComment="Approved"
```