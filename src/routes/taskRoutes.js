import express from "express";
import {
  create,
  getAll,
  getDetail,
  update,
  remove,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getDetail);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
