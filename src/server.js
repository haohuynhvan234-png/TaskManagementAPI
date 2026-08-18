import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import swaggerSpec from "./swagger/swagger.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Management API is running",
    docs: "/api-docs",
  });
});

app.use("/api/tasks", taskRoutes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Task Management API Docs",
    customCss: ".swagger-ui .topbar { display: none; }",
  }),
);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
      statusCode: 400,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    statusCode: 500,
  });
});

if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn(
    "⚠️ MONGO_URI is not defined. Set it in .env before using MongoDB-backed APIs.",
  );
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
