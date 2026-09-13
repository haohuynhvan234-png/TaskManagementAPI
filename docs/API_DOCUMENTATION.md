# 📘 Task Management API — Tài liệu kết nối cho FE

> Tài liệu tham chiếu đầy đủ (routes + payload + response) cho team **Frontend** kết nối vào API.
>
> File này được **sinh trực tiếp từ source code** (`src/server.js`, `src/routes/taskRoutes.js`, `src/controllers/taskController.js`, `src/models/taskModel.js`) nên phản ánh chính xác hành vi thật của API.

---

## 1. Tổng quan

| Mục | Giá trị |
| --- | --- |
| Base URL | `http://localhost:3001` |
| Server | Express 5 + MongoDB (Mongoose 9) |
| Định dạng dữ liệu | `application/json` (body gửi đi và response đều là JSON) |
| Xác thực | Chưa có — tất cả route hiện `security: []` |
| Giao diện thử nghiệm | Swagger UI: `GET /api-docs` · Spec JSON: `GET /api-docs.json` |

### CORS (server đã bật sẵn)

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization`
- Request `OPTIONS` (preflight) → `204 No Content`

> FE gọi từ domain khác không cần proxy hay cấu hình CORS thêm.

### Endpoint gốc

`GET /` — kiểm tra server chạy:

```json
{
  "success": true,
  "message": "Task Management API is running",
  "docs": "/api-docs"
}
```

---

## 2. Danh sách route (tổng quan)

Toàn bộ route task được mount tại **`/api/tasks`**.

| # | Method | Path                    | Chức năng                              |
| - | ------ | ----------------------- | -------------------------------------- |
| 1 | GET    | `/api/tasks`            | Lấy danh sách task (lọc + phân trang)  |
| 2 | POST   | `/api/tasks`            | Tạo task mới                           |
| 3 | GET    | `/api/tasks/:id`        | Lấy chi tiết một task theo `_id`       |
| 4 | PUT    | `/api/tasks/:id`        | Cập nhật task (chỉ field được gửi)     |
| 5 | PATCH  | `/api/tasks/:id/status` | Đổi trạng thái (chỉ tiến tới bước kế)  |
| 6 | DELETE | `/api/tasks/:id`        | Xóa task                               |

> `:id` phải là **MongoDB ObjectId** hợp lệ (chuỗi 24 ký tự hex, ví dụ `64f7d7c3a3d0b987654321ab`).

---

## 3. Task Object (dữ liệu trả về)

`Task` là object chuẩn nằm trong `data` của mọi response liên quan task.

### 3.1. Bảng field (từ Mongoose schema thật)

| Field         | Kiểu                        | Bắt buộc | Mặc định   | Ghi chú                          |
| ------------- | --------------------------- | -------- | ---------- | -------------------------------- |
| `_id`         | string (ObjectId)           | —        | —          | Server sinh, **không sửa được**  |
| `title`       | string                      | ✅ Có    | —          | Không được rỗng, tự trim         |
| `description` | string                      | Không    | `""`       | Mô tả chi tiết                   |
| `status`      | `todo` \| `doing` \| `done` | Không    | `"todo"`   | Trạng thái công việc             |
| `priority`    | `low` \| `medium` \| `high` | Không    | `"medium"` | Độ ưu tiên                       |
| `dueDate`     | ISO date \| `null`          | Không    | `null`     | Hạn chót, định dạng ISO 8601     |
| `createdAt`   | ISO datetime                | —        | auto       | Server tự thêm, **không sửa được** |
| `updatedAt`   | ISO datetime                | —        | auto       | Server tự cập nhật, **không sửa được** |

### 3.2. Ví dụ một Task

```json
{
  "_id": "64f7d7c3a3d0b987654321ab",
  "title": "Viết API cho module báo cáo",
  "description": "Tạo API, kiểm tra logic xử lý và tối ưu response",
  "status": "doing",
  "priority": "high",
  "dueDate": "2026-08-20T00:00:00.000Z",
  "createdAt": "2026-08-16T08:10:00.000Z",
  "updatedAt": "2026-08-16T08:25:00.000Z"
}
```

> ⚠️ **Lưu ý:** Swagger UI (`/api-docs.json`) hiện còn hiển thị 2 field `link` và `completed` — nhưng chúng **KHÔNG tồn tại** trong Mongoose schema, controller và DB thật. FE **không gửi và không phụ thuộc** vào `link` / `completed`.

---

## 4. Định dạng response chuẩn

### 4.1. Success

| Hoàn cảnh               | Shape                                          |
| ----------------------- | ---------------------------------------------- |
| Danh sách               | `{ success: true, data: Task[], pagination: {...} }` |
| Tạo / Sửa / Đổi status  | `{ success: true, message: string, data: Task }` |
| Chi tiết 1 task         | `{ success: true, data: Task }`                |
| Xóa thành công          | `{ success: true, message: string }`           |

### 4.2. Error (luôn cùng 1 shape)

```json
{
  "success": false,
  "message": "Mô tả ngắn gọn lỗi",
  "details": ["Chi tiết lỗi 1", "Chi tiết lỗi 2"],
  "statusCode": 400
}
```

- `details` là **mảng chuỗi** — FE nên hiển thị từng dòng (ví dụ dưới từng field form).
- Riêng 2 lỗi từ middleware toàn cục **không có mảng `details`**:
  - `400` `{ "success": false, "message": "Invalid JSON body", "statusCode": 400 }` (body không parse được JSON)
  - `500` `{ "success": false, "message": "Internal server error", "statusCode": 500 }` (lỗi ngoài ý muốn)

---

## 5. Chi tiết từng route

### 5.1. `GET /api/tasks` — Danh sách task

**Query parameters** (tất cả tùy chọn; lọc/sắp xếp/phân trang do server xử lý):

| Param      | Kiểu / Giá trị hợp lệ          | Mặc định    | Mô tả                                             |
| ---------- | ------------------------------ | ----------- | ------------------------------------------------- |
| `status`   | `todo` \| `doing` \| `done`    | (không lọc) | Lọc theo trạng thái                              |
| `priority` | `low` \| `medium` \| `high`    | (không lọc) | Lọc theo độ ưu tiên                              |
| `search`   | string                         | (không lọc) | Tìm theo `title`, không phân biệt hoa thường (`$regex` + `i`) |
| `title`    | string                         | —           | **Alias** của `search` (server ưu tiên `search`) |
| `page`     | integer ≥ 1                    | `1`         | Trang hiện tại (`Math.max(1, page)`)             |
| `limit`    | integer 1–100                  | `10`        | Số item/trang (clamp trong [1,100])              |
| `sortBy`   | `createdAt` \| `dueDate`       | `createdAt` | Field sắp xếp (giá trị khác → fallback `createdAt`) |
| `order`    | `asc` \| `desc`                | `desc`      | Chiều sắp xếp (khác `asc` → `desc`)              |

**Ví dụ request:**

```
GET /api/tasks?status=doing&priority=high&search=API&page=1&limit=10&sortBy=dueDate&order=asc
```

**Response `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f7d7c3a3d0b987654321ab",
      "title": "Viết API cho module báo cáo",
      "description": "Tạo API, kiểm tra logic xử lý và tối ưu response",
      "status": "doing",
      "priority": "high",
      "dueDate": "2026-08-20T00:00:00.000Z",
      "createdAt": "2026-08-16T08:10:00.000Z",
      "updatedAt": "2026-08-16T08:25:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "totalPages": 3
  }
}
```

**Đối tượng `pagination`:**

| Field        | Mô tả                               |
| ------------ | ----------------------------------- |
| `page`       | Trang hiện tại (sau clamp)          |
| `limit`      | Số item/trang thực tế (sau clamp)   |
| `total`      | Tổng số item khớp bộ lọc            |
| `totalPages` | `Math.ceil(total / limit)`          |

> ℹ️ **FE lưu ý:** response **không có** `hasNextPage` / `hasPrevPage`. FE tự suy ra: có trang sau khi `page < totalPages`, có trang trước khi `page > 1`.

**Response error:**

- `400` — `status` không hợp lệ:
```json
{ "success": false, "message": "Invalid status filter", "details": ["Status must be one of: todo, doing, done"], "statusCode": 400 }
```
- `400` — `priority` không hợp lệ:
```json
{ "success": false, "message": "Invalid priority filter", "details": ["Priority must be one of: low, medium, high"], "statusCode": 400 }
```
- `500` — `{ "success": false, "message": "Server error while fetching tasks", "details": [error.message], "statusCode": 500 }`

---

### 5.2. `POST /api/tasks` — Tạo task mới

**Headers:** `Content-Type: application/json` (bắt buộc)

**Payload (body):**

| Field         | Bắt buộc | Kiểu                          | Ràng buộc                                        |
| ------------- | -------- | ----------------------------- | ------------------------------------------------ |
| `title`       | ✅ Có    | string                        | Chuỗi **không rỗng** (trim)                      |
| `description` | Không    | string                        | Phải là string nếu gửi                           |
| `status`      | Không    | `todo` \| `doing` \| `done`   | Không gửi → `"todo"`                             |
| `priority`    | Không    | `low` \| `medium` \| `high`   | Không gửi → `"medium"`                           |
| `dueDate`     | Không    | ISO 8601 datetime/date string | Phải parse thành Date hợp lệ; có thể `null`      |

**Lưu ý:** Không gửi `_id`, `createdAt`, `updatedAt` — server trả `400`.

**Ví dụ payload:**

```json
{
  "title": "Viết API cho module báo cáo",
  "description": "Tạo API, kiểm tra logic xử lý và tối ưu response",
  "status": "doing",
  "priority": "high",
  "dueDate": "2026-08-20T00:00:00.000Z"
}
```

**Payload tối thiểu:** chỉ cần `{ "title": "..." }` — các field khác nhận giá trị mặc định.

**Response `201 Created`:**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "64f7d7c3a3d0b987654321ab",
    "title": "Viết API cho module báo cáo",
    "description": "Tạo API, kiểm tra logic xử lý và tối ưu response",
    "status": "doing",
    "priority": "high",
    "dueDate": "2026-08-20T00:00:00.000Z",
    "createdAt": "2026-08-16T08:10:00.000Z",
    "updatedAt": "2026-08-16T08:10:00.000Z"
  }
}
```

**Response error `400` — `message` & `details` theo từng trường hợp:**

| Trường hợp                      | `message`          | `details`                                                     |
| ------------------------------- | ------------------ | ------------------------------------------------------------- |
| Body rỗng / thiếu               | `Invalid task data` | `["Request body is required"]`                               |
| Thiếu `title`                   | `Invalid task data` | `["Title is required"]`                                      |
| `title` rỗng / không phải string | `Invalid task data` | `["Title must be a non-empty string"]`                       |
| `description` không phải string  | `Invalid task data` | `["Description must be a string"]`                           |
| `status` sai                    | `Invalid task data` | `["Status must be one of: todo, doing, done"]`               |
| `priority` sai                  | `Invalid task data` | `["Priority must be one of: low, medium, high"]`             |
| `dueDate` sai định dạng         | `Invalid task data` | `["Due date is invalid"]`                                    |
| Gửi `createdAt`                 | `Invalid task data` | `["createdAt cannot be updated"]`                            |
| Gửi `_id`                       | `Invalid task data` | `["_id cannot be updated"]`                                  |
| Lỗi validate từ Mongoose         | `Validation failed` | Danh sách message từng field, vd `["Title is required"]`     |

**Response error khác:** `500` — `{ "success": false, "message": "Server error while creating task", "details": [error.message], "statusCode": 500 }`

---

### 5.3. `GET /api/tasks/:id` — Chi tiết một task

**Path params:** `id` — MongoDB ObjectId (bắt buộc).

**Response `200 OK`:**

```json
{
  "success": true,
  "data": {
    "_id": "64f7d7c3a3d0b987654321ab",
    "title": "Viết API cho module báo cáo",
    "description": "Tạo API, kiểm tra logic xử lý và tối ưu response",
    "status": "doing",
    "priority": "high",
    "dueDate": "2026-08-20T00:00:00.000Z",
    "createdAt": "2026-08-16T08:10:00.000Z",
    "updatedAt": "2026-08-16T08:25:00.000Z"
  }
}
```

**Response error:**

- `400` — `id` không phải ObjectId hợp lệ:
```json
{ "success": false, "message": "Invalid task id", "details": ["Task id must be a valid Mongo ObjectId"], "statusCode": 400 }
```
- `404` — không tìm thấy:
```json
{ "success": false, "message": "Task not found", "details": ["No task exists for the given id"], "statusCode": 404 }
```
- `500` — `{ "success": false, "message": "Server error while fetching task", "details": [error.message], "statusCode": 500 }`

---

### 5.4. `PUT /api/tasks/:id` — Cập nhật task

**Path params:** `id` — MongoDB ObjectId (bắt buộc).
**Headers:** `Content-Type: application/json`.

**Payload (body)** — **TẤT CẢ field đều tùy chọn** (cập nhật từng phần), nhưng **body không được rỗng**:

| Field         | Bắt buộc | Kiểu                          | Ràng buộc                                      |
| ------------- | -------- | ----------------------------- | ---------------------------------------------- |
| `title`       | Không    | string                        | Nếu gửi thì phải là chuỗi không rỗng           |
| `description` | Không    | string                        | Phải là string nếu gửi                         |
| `status`      | Không    | `todo` \| `doing` \| `done`   | —                                              |
| `priority`    | Không    | `low` \| `medium` \| `high`   | —                                              |
| `dueDate`     | Không    | ISO 8601 datetime/date string | Phải parse thành Date hợp lệ; có thể `null`    |

**Ví dụ payload:**

```json
{
  "title": "Cập nhật kế hoạch sprint",
  "description": "Đã bổ sung task từ review và cập nhật deadline",
  "priority": "medium",
  "dueDate": "2026-08-25T00:00:00.000Z"
}
```

> Lưu ý: Không gửi `_id`, `createdAt`, `updatedAt` (server trả `400`). Khi vừa tải trang chi tiết, FE chỉ đưa các field đã sửa vào body, **không gửi nguyên object Task** lên.

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "64f7d7c3a3d0b987654321ab",
    "title": "Cập nhật kế hoạch sprint",
    "description": "Đã bổ sung task từ review và cập nhật deadline",
    "status": "doing",
    "priority": "medium",
    "dueDate": "2026-08-25T00:00:00.000Z",
    "createdAt": "2026-08-16T08:10:00.000Z",
    "updatedAt": "2026-08-16T09:00:00.000Z"
  }
}
```

**Response error `400`:**

| Trường hợp                    | `message`           | `details`                                                |
| ----------------------------- | ------------------- | -------------------------------------------------------- |
| Body rỗng (`{}`)              | `Invalid update payload` | `["At least one field is required for update"]`     |
| Lỗi field (giống POST)        | `Invalid task data` | Ví dụ `["Title must be a non-empty string"]`             |
| `id` không hợp lệ             | `Invalid task id`   | `["Task id must be a valid Mongo ObjectId"]`             |
| Lỗi validate từ Mongoose       | `Validation failed` | Danh sách message từng field                             |

**Response error khác:**

- `404` — `{ "success": false, "message": "Task not found", "details": ["No task exists for the given id"], "statusCode": 404 }`
- `500` — `{ "success": false, "message": "Server error while updating task", "details": [error.message], "statusCode": 500 }`

---

### 5.5. `PATCH /api/tasks/:id/status` — Đổi trạng thái task

**Path params:** `id` — MongoDB ObjectId (bắt buộc).

**Payload (body):**

| Field    | Bắt buộc | Kiểu                    | Mô tả                    |
| -------- | -------- | ----------------------- | ------------------------ |
| `status` | ✅ Có    | `todo` \| `doing` \| `done` | Trạng thái muốn chuyển tới |

```json
{
  "status": "doing"
}
```

> 🔒 **Quy tắc quan trọng (server bắt buộc):** trạng thái chỉ được **tiến thuận 1 bước**:
> ```
> todo → doing → done
> ```
> - `todo → doing` ✅ hợp lệ
> - `doing → done` ✅ hợp lệ
> - `todo → done` ❌ bị từ chối (400)
> - `doing → todo` ❌ bị từ chối (400) — không cho lùi
> - `done → bất kỳ` ❌ bị từ chối (400)
>
> **FE cần:** chỉ hiển thị / bật nút chuyển tới trạng thái kế tiếp (`todo` → "Chuyển sang Doing", `doing` → "Chuyển sang Done", `done` → không hiển thị nút).

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "_id": "64f7d7c3a3d0b987654321ab",
    "title": "Viết API cho module báo cáo",
    "description": "Tạo API, kiểm tra logic xử lý và tối ưu response",
    "status": "done",
    "priority": "high",
    "dueDate": "2026-08-20T00:00:00.000Z",
    "createdAt": "2026-08-16T08:10:00.000Z",
    "updatedAt": "2026-08-16T08:30:00.000Z"
  }
}
```

**Response error `400`:**

| Trường hợp                      | `message`                   | `details`                                                |
| ------------------------------- | --------------------------- | -------------------------------------------------------- |
| Thiếu / sai `status`            | `Invalid status`            | `["Status must be one of: todo, doing, done"]`           |
| Chuyển không đúng bước kế tiếp  | `Invalid status transition` | `["Task status can only move from doing to done"]` (message động theo trạng thái hiện tại) |
| `id` không hợp lệ               | `Invalid task id`           | `["Task id must be a valid Mongo ObjectId"]`             |

**Response error khác:**

- `404` — `{ "success": false, "message": "Task not found", "details": ["No task exists for the given id"], "statusCode": 404 }`
- `500` — `{ "success": false, "message": "Server error while updating task status", "details": [error.message], "statusCode": 500 }`

---

### 5.6. `DELETE /api/tasks/:id` — Xóa task

**Path params:** `id` — MongoDB ObjectId (bắt buộc).

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Response error:**

- `400` — `{ "success": false, "message": "Invalid task id", "details": ["Task id must be a valid Mongo ObjectId"], "statusCode": 400 }`
- `404` — `{ "success": false, "message": "Task not found", "details": ["No task exists for the given id"], "statusCode": 404 }`
- `500` — `{ "success": false, "message": "Server error while deleting task", "details": [error.message], "statusCode": 500 }`

---

## 6. Bảng tổng hợp HTTP Status Code

| Status | Khi nào                                            | Shape trả về                                          |
| ------ | -------------------------------------------------- | ----------------------------------------------------- |
| `200`  | Thành công (danh sách, chi tiết, sửa, đổi status, xóa) | Envelope success tương ứng từng route                 |
| `201`  | Tạo task thành công                                | `{ success, message, data }`                          |
| `204`  | Preflight `OPTIONS` thành công                     | Không body                                            |
| `400`  | Payload/param/`id` không hợp lệ, chuyển status sai | `{ success: false, message, details, statusCode }`    |
| `404`  | Không tìm thấy task theo `id`                      | `{ success: false, message, details, statusCode }`    |
| `500`  | Lỗi server                                         | `{ success: false, message, details, statusCode }`    |

## 7. Lưu ý quan trọng khi FE kết nối

1. **Cập nhật từng phần:** `PUT /:id` chỉ nhận các field được gửi trong body — không gửi nguyên Task object.
2. **Status chỉ tiến thuận 1 bước** (`todo → doing → done`) — giao diện chỉ cung cấp nút chuyển đúng bước kế tiếp.
3. **Phân trang & lọc server-side:** gửi `page`, `limit`, `status`, `priority`, `search`, `sortBy`, `order` qua query string; không tự lọc/phân trang trong FE.
4. **Pagination không có `hasNextPage`/`hasPrevPage`** — tự tính qua `page < totalPages` và `page > 1`.
5. **Field không được sửa từ FE:** `_id`, `createdAt`, `updatedAt`. Gửi lên sẽ nhận `400`.
6. **`dueDate`:** gửi dạng chuỗi ISO 8601 (`2026-08-25` hoặc `2026-08-25T00:00:00.000Z`); xóa hạn chót thì gửi `null`.
7. **Hiển thị lỗi:** luôn đọc `message` + từng phần tử trong `details`; trường hợp không có `details` thì hiển thị `message` trực tiếp.
8. **`search` tìm theo `title`** với regex không phân biệt hoa thường — không cần mã hóa ký tự đặc biệt cho keyword thông thường.
9. **Không dùng field `link` / `completed`** (chỉ có trong Swagger cũ, không tồn tại trong DB/controller thật).
10. **Base URL cho production:** thay `http://localhost:3001` bằng domain server API thật tại môi trường deploy.

## 8. Ví dụ gọi API (fetch / axios)

### fetch

```js
const BASE_URL = "http://localhost:3001/api/tasks";

// Danh sách có lọc + phân trang
const list = await fetch(
  `${BASE_URL}?status=todo&priority=high&page=1&limit=10`
).then((r) => r.json());
// list = { success, data: [], pagination: { page, limit, total, totalPages } }

// Tạo task
const created = await fetch(BASE_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Task mới", priority: "high" }),
}).then((r) => r.json());

// Cập nhật
const updated = await fetch(`${BASE_URL}/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Tên mới" }),
}).then((r) => r.json());

// Đổi status (chỉ bước kế tiếp)
const moved = await fetch(`${BASE_URL}/${id}/status`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "doing" }),
}).then((r) => r.json());

// Xóa
const deleted = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" }).then((r) => r.json());
```

### axios

```js
import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:3001/api/tasks" });

const { data } = await api.get("", { params: { status: "todo", page: 1, limit: 10 } });
const { data: created } = await api.post("", { title: "Task mới" });
const { data: updated } = await api.put(`/${id}`, { priority: "low" });
const { data: moved } = await api.patch(`/${id}/status`, { status: "done" });
const { data: deleted } = await api.delete(`/${id}`);
```

> Xử lý lỗi: trong `catch`, đọc `error.response.data` (chứa `{ success, message, details, statusCode }`).

---

*Tài liệu được sinh từ source code thật của dự án. Nếu server thay đổi route/field, hãy cập nhật lại file này và cả `src/swagger/swagger.js` để đồng bộ.*