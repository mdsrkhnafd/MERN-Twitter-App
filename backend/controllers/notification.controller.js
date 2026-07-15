import Notification from "../models/notification.model.js";
import mongoose from "mongoose";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "from",
        select: "fullName username profileImg",
      });

    // Only unread notifications will be updated.
    await Notification.updateMany(
      { to: userId, read: false },
      { $set: { read: true } },
    );
    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Notification.deleteMany({
      to: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteNotificationsById = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        message: "Invalid notification id",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      to: userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
