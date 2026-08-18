import mongoose from "mongoose";
import Task from "../models/taskModel.js";

const VALID_STATUS = ["todo", "doing", "done"];
const VALID_PRIORITY = ["low", "medium", "high"];

const sendError = (res, statusCode, message, details = []) => {
  res.status(statusCode).json({
    success: false,
    message,
    details,
    statusCode,
  });
};

const validateTaskPayload = (payload, { allowPartial = false } = {}) => {
  const errors = [];

  if (!allowPartial && (!payload || Object.keys(payload).length === 0)) {
    errors.push("Request body is required");
    return { valid: false, errors };
  }

  if (payload.title !== undefined) {
    if (typeof payload.title !== "string" || !payload.title.trim()) {
      errors.push("Title must be a non-empty string");
    }
  }

  if (!allowPartial && payload.title === undefined) {
    errors.push("Title is required");
  }

  if (
    payload.description !== undefined &&
    typeof payload.description !== "string"
  ) {
    errors.push("Description must be a string");
  }

  if (payload.status !== undefined && !VALID_STATUS.includes(payload.status)) {
    errors.push("Status must be one of: todo, doing, done");
  }

  if (
    payload.priority !== undefined &&
    !VALID_PRIORITY.includes(payload.priority)
  ) {
    errors.push("Priority must be one of: low, medium, high");
  }

  if (payload.dueDate !== undefined) {
    const dueDate = new Date(payload.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      errors.push("Due date is invalid");
    }
  }

  if (payload.createdAt !== undefined) {
    errors.push("createdAt cannot be updated");
  }

  if (payload._id !== undefined) {
    errors.push("_id cannot be updated");
  }

  return { valid: errors.length === 0, errors };
};

export const getAll = async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      title,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filters = {};

    if (status) {
      if (!VALID_STATUS.includes(status)) {
        return sendError(res, 400, "Invalid status filter", [
          "Status must be one of: todo, doing, done",
        ]);
      }
      filters.status = status;
    }

    if (priority) {
      if (!VALID_PRIORITY.includes(priority)) {
        return sendError(res, 400, "Invalid priority filter", [
          "Priority must be one of: low, medium, high",
        ]);
      }
      filters.priority = priority;
    }

    const searchKeyword = (search ?? title ?? "").toString().trim();
    if (searchKeyword) {
      filters.title = { $regex: searchKeyword, $options: "i" };
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 10));
    const validSortFields = ["createdAt", "dueDate"];
    const currentSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";
    const currentOrder = order === "asc" ? 1 : -1;

    const total = await Task.countDocuments(filters);
    const tasks = await Task.find(filters)
      .sort({ [currentSortBy]: currentOrder })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    return res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching tasks", [
      error.message,
    ]);
  }
};

export const create = async (req, res) => {
  try {
    const validation = validateTaskPayload(req.body, { allowPartial: false });
    if (!validation.valid) {
      return sendError(res, 400, "Invalid task data", validation.errors);
    }

    const task = await Task.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(
        res,
        400,
        "Validation failed",
        Object.values(error.errors).map((item) => item.message),
      );
    }

    return sendError(res, 500, "Server error while creating task", [
      error.message,
    ]);
  }
};

export const getDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid task id", [
        "Task id must be a valid Mongo ObjectId",
      ]);
    }

    const task = await Task.findById(id).lean();
    if (!task) {
      return sendError(res, 404, "Task not found", [
        "No task exists for the given id",
      ]);
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return sendError(res, 500, "Server error while fetching task", [
      error.message,
    ]);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid task id", [
        "Task id must be a valid Mongo ObjectId",
      ]);
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return sendError(res, 400, "Invalid update payload", [
        "At least one field is required for update",
      ]);
    }

    const validation = validateTaskPayload(req.body, { allowPartial: true });
    if (!validation.valid) {
      return sendError(res, 400, "Invalid task data", validation.errors);
    }

    const task = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return sendError(res, 404, "Task not found", [
        "No task exists for the given id",
      ]);
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendError(
        res,
        400,
        "Validation failed",
        Object.values(error.errors).map((item) => item.message),
      );
    }

    return sendError(res, 500, "Server error while updating task", [
      error.message,
    ]);
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid task id", [
        "Task id must be a valid Mongo ObjectId",
      ]);
    }

    if (!status || !VALID_STATUS.includes(status)) {
      return sendError(res, 400, "Invalid status", [
        "Status must be one of: todo, doing, done",
      ]);
    }

    const task = await Task.findById(id);
    if (!task) {
      return sendError(res, 404, "Task not found", [
        "No task exists for the given id",
      ]);
    }

    const allowedOrder = ["todo", "doing", "done"];
    const currentIndex = allowedOrder.indexOf(task.status);
    const nextIndex = allowedOrder.indexOf(status);

    if (nextIndex !== currentIndex + 1) {
      return sendError(res, 400, "Invalid status transition", [
        `Task status can only move from ${allowedOrder[currentIndex]} to ${allowedOrder[currentIndex + 1]}`,
      ]);
    }

    task.status = status;
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    return sendError(res, 500, "Server error while updating task status", [
      error.message,
    ]);
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid task id", [
        "Task id must be a valid Mongo ObjectId",
      ]);
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return sendError(res, 404, "Task not found", [
        "No task exists for the given id",
      ]);
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return sendError(res, 500, "Server error while deleting task", [
      error.message,
    ]);
  }
};
