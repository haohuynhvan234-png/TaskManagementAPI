import express from "express";
import {
  create,
  getAll,
  getDetail,
  update,
  remove,
  updateStatus,
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", getAll);
router.post("/", create);
router.get("/:id", getDetail);
router.put("/:id", update);
router.patch("/:id/status", updateStatus);
router.delete("/:id", remove);

export default router;
