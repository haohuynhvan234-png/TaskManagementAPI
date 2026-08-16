import * as taskService from "../services/taskService.js";

export const create = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json({ message: "Thành công", data: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  const tasks = await taskService.getAllTasks();
  res.status(200).json(tasks);
};

export const getDetail = async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ message: "Không tìm thấy" });
  res.status(200).json(task);
};

export const update = async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.status(200).json(task);
};

export const remove = async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.status(200).json({ message: "Đã xóa" });
};
