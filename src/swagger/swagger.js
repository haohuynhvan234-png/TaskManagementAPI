const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Task Management API",
    version: "1.0.0",
    description:
      "API quản lý nhiệm vụ (Task Management) cho hệ thống. Project hiện tại cung cấp CRUD mẫu cho resource Task với MongoDB và Express.",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Tasks",
      description: "Quản lý các nhiệm vụ trong hệ thống",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT token được gửi trong header Authorization: Bearer <token>",
      },
      apiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        description:
          "API key tùy chọn nếu hệ thống có triển khai xác thực theo key",
      },
    },
    schemas: {
      Task: {
        type: "object",
        required: ["title"],
        properties: {
          _id: {
            type: "string",
            example: "64f7d7c3a3d0b987654321ab",
            description: "MongoDB ObjectId",
          },
          title: {
            type: "string",
            example: "Viết API cho module báo cáo",
            description: "Tiêu đề công việc",
          },
          description: {
            type: "string",
            nullable: true,
            example: "Tạo API, kiểm tra logic xử lý và tối ưu response",
            description: "Mô tả chi tiết nhiệm vụ",
          },
          link: {
            type: "string",
            nullable: true,
            format: "uri",
            example: "https://example.com/tasks/123",
            description: "Đường dẫn liên kết liên quan đến task",
          },
          completed: {
            type: "boolean",
            default: false,
            example: false,
            description: "Trạng thái hoàn thành của task",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-08-16T08:10:00.000Z",
            description: "Thời gian tạo task",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-08-16T08:25:00.000Z",
            description: "Thời gian cập nhật gần nhất",
          },
        },
      },
      TaskCreateRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: {
            type: "string",
            example: "Lập kế hoạch sprint",
          },
          description: {
            type: "string",
            nullable: true,
            example:
              "Phân tích backlog, ước lượng công việc và lên lịch review",
          },
          link: {
            type: "string",
            nullable: true,
            format: "uri",
            example: "https://example.com/sprint/planning",
          },
          completed: {
            type: "boolean",
            default: false,
            example: false,
          },
        },
      },
      TaskUpdateRequest: {
        type: "object",
        properties: {
          title: {
            type: "string",
            example: "Cập nhật kế hoạch sprint",
          },
          description: {
            type: "string",
            nullable: true,
            example: "Đã bổ sung task từ review và cập nhật deadline",
          },
          link: {
            type: "string",
            nullable: true,
            format: "uri",
            example: "https://example.com/sprint/review",
          },
          completed: {
            type: "boolean",
            example: true,
          },
        },
      },
      SuccessMessage: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Thành công",
          },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Error message here",
          },
          message: {
            type: "string",
            example: "Không tìm thấy",
          },
        },
      },
      DeletedResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Đã xóa",
          },
        },
      },
    },
  },
  paths: {
    "/api/tasks": {
      post: {
        tags: ["Tasks"],
        summary: "Tạo task mới",
        description:
          "Tạo một nhiệm vụ mới trong MongoDB. Dữ liệu được lưu theo schema Task.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskCreateRequest" },
              example: {
                title: "Viết API cho module báo cáo",
                description: "Tạo API, kiểm tra logic xử lý và tối ưu response",
                link: "https://example.com/tasks/123",
                completed: false,
              },
            },
          },
        },
        responses: {
          201: {
            description: "Task được tạo thành công",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Thành công" },
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          500: {
            description: "Lỗi server hoặc lỗi khi lưu task",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Tasks"],
        summary: "Lấy danh sách tất cả task",
        description:
          "Trả về toàn bộ danh sách task hiện có trong cơ sở dữ liệu.",
        security: [],
        responses: {
          200: {
            description: "Danh sách task",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Task" },
                },
                example: [
                  {
                    _id: "64f7d7c3a3d0b987654321ab",
                    title: "Viết API cho module báo cáo",
                    description:
                      "Tạo API, kiểm tra logic xử lý và tối ưu response",
                    link: "https://example.com/tasks/123",
                    completed: false,
                    createdAt: "2026-08-16T08:10:00.000Z",
                    updatedAt: "2026-08-16T08:25:00.000Z",
                  },
                ],
              },
            },
          },
        },
      },
    },
    "/api/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Lấy chi tiết task theo ID",
        description: "Trả về một task cụ thể dựa trên MongoDB ObjectId.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "MongoDB ObjectId của task",
            schema: { type: "string", example: "64f7d7c3a3d0b987654321ab" },
          },
        ],
        responses: {
          200: {
            description: "Tìm thấy task",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" },
              },
            },
          },
          404: {
            description: "Không tìm thấy task theo id",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Không tìm thấy" },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Tasks"],
        summary: "Cập nhật task theo ID",
        description:
          "Cập nhật thông tin của task đã tồn tại. Chỉ các field được gửi sẽ được cập nhật theo logic Mongoose.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "MongoDB ObjectId của task cần cập nhật",
            schema: { type: "string", example: "64f7d7c3a3d0b987654321ab" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskUpdateRequest" },
              example: {
                title: "Cập nhật kế hoạch sprint",
                description: "Đã bổ sung task từ review và cập nhật deadline",
                completed: true,
              },
            },
          },
        },
        responses: {
          200: {
            description: "Task đã được cập nhật",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Xóa task theo ID",
        description:
          "Xóa task dựa trên ObjectId. Trả về thông báo thành công sau khi xóa.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "MongoDB ObjectId của task cần xóa",
            schema: { type: "string", example: "64f7d7c3a3d0b987654321ab" },
          },
        ],
        responses: {
          200: {
            description: "Xóa task thành công",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeletedResponse" },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerDefinition;
