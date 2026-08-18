# API_TaskManagement - API Documentation

## 1. Overview

This project provides a REST API for managing tasks using Node.js, Express, and MongoDB. The API supports CRUD operations, filtering, search, pagination, sorting, and status transition validation.

Base URL:

- Local: http://localhost:3001
- Railway: https://your-app-name.up.railway.app

---

## 2. Task Model

```json
{
  "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
  "title": "Học Express.js",
  "description": "Hoàn thành REST API",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2026-08-20T00:00:00.000Z",
  "createdAt": "2026-08-16T08:00:00.000Z",
  "updatedAt": "2026-08-16T08:00:00.000Z"
}
```

### Rules

- `title`: required
- `description`: optional
- `status`: `todo | doing | done`, default `todo`
- `priority`: `low | medium | high`, default `medium`
- `dueDate`: optional
- `createdAt` and `updatedAt`: generated automatically by MongoDB/Mongoose

---

## 3. Common Response Format

### Success response

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
    "title": "Học Express.js",
    "description": "Hoàn thành REST API",
    "status": "todo",
    "priority": "medium",
    "dueDate": "2026-08-20T00:00:00.000Z"
  }
}
```

### Error response

```json
{
  "success": false,
  "message": "Invalid task data",
  "details": ["Title is required", "Status must be one of: todo, doing, done"],
  "statusCode": 400
}
```

---

## 4. Endpoints

### 4.1 Get all tasks

Request:

```http
GET /api/tasks
```

Query parameters:

- `status`: `todo | doing | done`
- `priority`: `low | medium | high`
- `search` or `title`: search by task title
- `page`: page number, default `1`
- `limit`: items per page, default `10`
- `sortBy`: `createdAt | dueDate`, default `createdAt`
- `order`: `asc | desc`, default `desc`

Example:

```http
GET /api/tasks?status=todo&priority=high&page=1&limit=10
```

Success response `200`:

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
      "title": "Học Express.js",
      "description": "Hoàn thành REST API",
      "status": "todo",
      "priority": "high",
      "dueDate": "2026-08-20T00:00:00.000Z",
      "createdAt": "2026-08-16T08:00:00.000Z",
      "updatedAt": "2026-08-16T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4.2 Create task

Request:

```http
POST /api/tasks
```

Body:

```json
{
  "title": "Học Express.js",
  "description": "Hoàn thành REST API",
  "priority": "high",
  "dueDate": "2026-08-20"
}
```

Success response `201`:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
    "title": "Học Express.js",
    "description": "Hoàn thành REST API",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-08-20T00:00:00.000Z",
    "createdAt": "2026-08-16T08:00:00.000Z",
    "updatedAt": "2026-08-16T08:00:00.000Z"
  }
}
```

Validation errors `400` if `title` missing or invalid data.

---

### 4.3 Get task by id

Request:

```http
GET /api/tasks/:id
```

Example:

```http
GET /api/tasks/64f8d0c1a7d4b2c9d1e4f5a6
```

Success response `200`:

```json
{
  "success": true,
  "data": {
    "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
    "title": "Học Express.js",
    "description": "Hoàn thành REST API",
    "status": "todo",
    "priority": "medium",
    "dueDate": "2026-08-20T00:00:00.000Z",
    "createdAt": "2026-08-16T08:00:00.000Z",
    "updatedAt": "2026-08-16T08:00:00.000Z"
  }
}
```

Not found `404`:

```json
{
  "success": false,
  "message": "Task not found",
  "details": ["No task exists for the given id"],
  "statusCode": 404
}
```

---

### 4.4 Update task

Request:

```http
PUT /api/tasks/:id
```

Body example:

```json
{
  "title": "Học Express.js nâng cao",
  "description": "Cập nhật mô tả và deadline",
  "priority": "medium",
  "status": "doing",
  "dueDate": "2026-08-25"
}
```

Rules:

- Allows partial updates
- `createdAt` cannot be updated
- `_id` cannot be updated
- Invalid ObjectId => `400`

Success response `200`:

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
    "title": "Học Express.js nâng cao",
    "description": "Cập nhật mô tả và deadline",
    "status": "doing",
    "priority": "medium",
    "dueDate": "2026-08-25T00:00:00.000Z",
    "createdAt": "2026-08-16T08:00:00.000Z",
    "updatedAt": "2026-08-16T08:30:00.000Z"
  }
}
```

---

### 4.5 Update task status

Request:

```http
PATCH /api/tasks/:id/status
```

Body:

```json
{
  "status": "doing"
}
```

Allowed transition order:

```text
todo -> doing -> done
```

Invalid examples:

- `todo -> done` => rejected
- `done -> doing` => rejected
- `doing -> todo` => rejected

Success response `200`:

```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
    "status": "doing"
  }
}
```

Invalid transition `400`:

```json
{
  "success": false,
  "message": "Invalid status transition",
  "details": ["Task status can only move from todo to doing"],
  "statusCode": 400
}
```

---

### 4.6 Delete task

Request:

```http
DELETE /api/tasks/:id
```

Success response `200`:

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

Not found `404`:

```json
{
  "success": false,
  "message": "Task not found",
  "details": ["No task exists for the given id"],
  "statusCode": 404
}
```

---

## 5. Error Codes

- `400`: invalid request body, invalid ObjectId, invalid enum value, invalid status transition
- `404`: task not found
- `500`: server/database error

---

## 6. Railway Deployment

1. Push the project to a GitHub repo.
2. Open Railway and create a new project.
3. Connect GitHub repo.
4. Add environment variable:
   - `MONGO_URI=<MongoDB connection string>`
   - `PORT=3001` (optional, Railway usually sets this automatically)
5. Deploy the service.
6. Use the generated Railway URL as the production base URL.

Example environment file:

```env
PORT=3001
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/API_TaskManagement?retryWrites=true&w=majority
```

---

## 7. Useful Test Examples

```http
GET http://localhost:3001/api/tasks
POST http://localhost:3001/api/tasks
PATCH http://localhost:3001/api/tasks/:id/status
PUT http://localhost:3001/api/tasks/:id
DELETE http://localhost:3001/api/tasks/:id
```

The project already includes a request collection in [taskAPI.http](taskAPI.http).
