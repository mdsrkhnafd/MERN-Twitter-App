import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the list of users I follow
    const usersFollowByMe = await User.findById(userId).select("following");

    // Get random 10 users excluding myself
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(userId) }, // ✅ ensure ObjectId
        },
      },
      { $sample: { size: 10 } },
    ]);

    // Filter out already-followed users
    const filteredUsers = users.filter(
      (user) => !usersFollowByMe.following.includes(user._id.toString()),
    );

    // Limit to 4 suggestions
    const suggestedUsers = filteredUsers.slice(0, 4);

    // Remove password field
    suggestedUsers.forEach((user) => (user.password = undefined));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("❌ Error in getSuggestedUsers Controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser)
      return res.status(404).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      // TODO: return the id of the user as a response
      res
        .status(200)
        .json({ success: true, message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      // Todo: send notification to the user
      const newNotification = new Notification({
        from: req.user._id,
        to: userToModify._id,
        type: "follow",
      });

      await newNotification.save();

      // TODO: return the id of the user as a response
      res.status(200).json({
        success: true,
        message: "User followed successfully",
      });
    }
  } catch (error) {
    console.log("❌ Error in followUnfollowUser Controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      username,
      currentPassword,
      newPassword,
      bio,
      link,
    } = req.body;

    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check email duplicate
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: userId }, // exclude current user
      });

      if (emailExists) {
        return res.status(400).json({
          error: "Email already exists",
        });
      }
    }

    // Check username duplicate
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({
        username,
        _id: { $ne: userId }, // exclude current user
      });

      if (usernameExists) {
        return res.status(400).json({
          error: "Username already exists",
        });
      }
    }

    // Check that both passwords are provided
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current and new passwords.",
      });
    }

    // Change password
    if (currentPassword && newPassword) {
      const isCorrectPassword = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isCorrectPassword) {
        return res.status(400).json({
          error: "Incorrect current password.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters long.",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (profileImg) {
      if (user.profileImg) {
        //https://res.cloudinary.com/dcoyszecc/image/upload/v1778697925/products/dfvug5xbevvmotc8wqkb.png
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0],
        );
      }
      const profileRes = await cloudinary.uploader.upload(profileImg);
      user.profileImg = profileRes.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0],
        );
      }
      const coverRes = await cloudinary.uploader.upload(coverImg);
      user.coverImg = coverRes.secure_url;
    }

    user.fullName = fullName ?? user.fullName;
    user.email = email ?? user.email;
    user.username = username ?? user.username;
    user.bio = bio ?? user.bio;
    user.link = link ?? user.link;

    user = await user.save();
    user.password = undefined;
    res.status(200).json(user);
  } catch (error) {
    console.log("❌ Error in updateUserProfile Controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
