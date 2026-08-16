# Task Management API - FE Integration Guide

## 1. Base URL

- Local dev: http://localhost:3001
- API prefix: /api/tasks
- Swagger docs: http://localhost:3001/api-docs
- Swagger JSON: http://localhost:3001/api-docs.json

## 2. CORS

Server đang cho phép tất cả origin và các method: GET, POST, PUT, DELETE, OPTIONS.

---

## 3. Task model

Mỗi task có cấu trúc như sau:

```json
{
  "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
  "title": "Viết API cho task",
  "description": "Tạo endpoint CRUD cho task management",
  "link": "https://example.com/task/123",
  "completed": false,
  "createdAt": "2026-08-16T10:00:00.000Z",
  "updatedAt": "2026-08-16T10:00:00.000Z",
  "__v": 0
}
```

### Field rules

- `title`: required, string
- `description`: optional, string
- `link`: optional, string
- `completed`: optional, boolean, default `false`

---

## 4. API Routes

### 1) Get all tasks

- Method: `GET`
- URL: `/api/tasks`
- Description: Lấy danh sách toàn bộ task

#### Request

```http
GET /api/tasks
```

#### Success response - 200

```json
[
  {
    "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
    "title": "Task 1",
    "description": "Mô tả task 1",
    "link": "https://example.com/1",
    "completed": false,
    "createdAt": "2026-08-16T10:00:00.000Z",
    "updatedAt": "2026-08-16T10:00:00.000Z",
    "__v": 0
  }
]
```

---

### 2) Create task

- Method: `POST`
- URL: `/api/tasks`
- Description: Tạo mới một task

#### Request body

```json
{
  "title": "Task mới",
  "description": "Mô tả task mới",
  "link": "https://example.com/task-new",
  "completed": false
}
```

#### Success response - 201

```json
{
  "message": "Thành công",
  "data": {
    "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
    "title": "Task mới",
    "description": "Mô tả task mới",
    "link": "https://example.com/task-new",
    "completed": false,
    "createdAt": "2026-08-16T10:00:00.000Z",
    "updatedAt": "2026-08-16T10:00:00.000Z",
    "__v": 0
  }
}
```

#### Error response - 500

```json
{
  "error": "message lỗi từ backend"
}
```

---

### 3) Get task by id

- Method: `GET`
- URL: `/api/tasks/:id`
- Description: Lấy chi tiết task theo id

#### Example

```http
GET /api/tasks/64f8d0c1a7d4b2c9d1e4f5a6
```

#### Success response - 200

```json
{
  "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
  "title": "Task 1",
  "description": "Mô tả task 1",
  "link": "https://example.com/1",
  "completed": false,
  "createdAt": "2026-08-16T10:00:00.000Z",
  "updatedAt": "2026-08-16T10:00:00.000Z",
  "__v": 0
}
```

#### Not found response - 404

```json
{
  "message": "Không tìm thấy"
}
```

---

### 4) Update task

- Method: `PUT`
- URL: `/api/tasks/:id`
- Description: Cập nhật task theo id

#### Request body

Có thể gửi 1 hoặc nhiều field tùy ý trong các field sau:

```json
{
  "title": "Task đã cập nhật",
  "description": "Nội dung mới",
  "link": "https://example.com/task-updated",
  "completed": true
}
```

#### Example

```http
PUT /api/tasks/64f8d0c1a7d4b2c9d1e4f5a6
```

#### Success response - 200

```json
{
  "_id": "64f8d0c1a7d4b2c9d1e4f5a6",
  "title": "Task đã cập nhật",
  "description": "Nội dung mới",
  "link": "https://example.com/task-updated",
  "completed": true,
  "createdAt": "2026-08-16T10:00:00.000Z",
  "updatedAt": "2026-08-16T10:20:00.000Z",
  "__v": 0
}
```

> Lưu ý: Backend không có check lỗi khi `id` không tồn tại, nên nếu không tìm thấy sẽ trả về `null`.

---

### 5) Delete task

- Method: `DELETE`
- URL: `/api/tasks/:id`
- Description: Xóa task theo id

#### Example

```http
DELETE /api/tasks/64f8d0c1a7d4b2c9d1e4f5a6
```

#### Success response - 200

```json
{
  "message": "Đã xóa"
}
```

---

## 5. Suggested frontend usage

### Fetch all tasks

```js
const res = await fetch("http://localhost:3001/api/tasks");
const data = await res.json();
console.log(data);
```

### Create task

```js
const res = await fetch("http://localhost:3001/api/tasks", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "Task mới",
    description: "Mô tả task mới",
    link: "https://example.com/task-new",
    completed: false,
  }),
});

const data = await res.json();
console.log(data);
```

### Update task

```js
const res = await fetch("http://localhost:3001/api/tasks/:id", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    completed: true,
    title: "Task đã cập nhật",
  }),
});

const data = await res.json();
console.log(data);
```

### Delete task

```js
const res = await fetch("http://localhost:3001/api/tasks/:id", {
  method: "DELETE",
});

const data = await res.json();
console.log(data);
```

---

## 6. Notes for FE

- Dùng `Content-Type: application/json` cho POST/PUT.
- Khi call tạo/sửa task, `title` là field bắt buộc.
- Nếu cần test nhanh trên browser hoặc Postman, có thể dùng Swagger UI tại `/api-docs`.
- Mặc định backend đang chạy trên port 3001; nếu đổi `PORT` trong `.env`, FE cần cập nhật base URL tương ứng.
