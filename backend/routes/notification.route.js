import express from "express";
import {
  getNotifications,
  deleteNotificationsById,
  deleteNotifications,
} from "../controllers/notification.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/", protectedRoute, deleteNotifications);
router.delete("/:id", protectedRoute, deleteNotificationsById);

export default router;
