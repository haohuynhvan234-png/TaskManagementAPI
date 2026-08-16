import Task from "../models/taskModel.js";

export const createTask = (data) => Task.create(data);
export const getAllTasks = () => Task.find();
export const getTaskById = (id) => Task.findById(id);
export const updateTask = (id, data) =>
  Task.findByIdAndUpdate(id, data, { new: true });
export const deleteTask = (id) => Task.findByIdAndDelete(id);
