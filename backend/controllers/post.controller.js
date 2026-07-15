import mongoose from "mongoose";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
  try {
    const text = req.body.text?.trim();
    const userId = req.user._id;
    let { img } = req.body;

    if (!text && !img) {
      return res.status(400).json({ error: "Text or image is required" });
    }

    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img, {
        folder: "twitter/posts",
      });

      img = uploadResponse.secure_url;
    }

    const newPost = await Post.create({
      user: userId,
      text,
      img,
    });

    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost controller:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not allowed to delete this post." });
    }

    // Optional: Delete Cloudinary image here
    if (post.img) {
      const postImgId = post.img
        .split("/")
        .slice(post.img.split("/").indexOf("twitter"))
        .join("/")
        .split(".")[0];

      await cloudinary.uploader.destroy(postImgId);
    }

    await post.deleteOne();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete Post Error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const text = req.body.text?.trim();
    const postId = req.params.id;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);
    await post.save();

    await post.populate("comments.user", "fullName username profileImg");

    // Todo: create a notification for this comment
    if (post.user.toString() !== userId.toString()) {
      await Notification.create({
        from: userId,
        to: post.user,
        type: "comment",
        post: postId,
      });
    }

    return res.status(201).json(post);
  } catch (error) {
    console.error("Comment Error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      return res.status(200).json(updatedLikes);
    } else {
      // Like the post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      if (post.user.toString() !== userId.toString()) {
        await Notification.create({
          from: userId,
          to: post.user,
          type: "like",
          post: postId,
        });
      }

      const updatedLikes = post.likes;
      return res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.error("Like/Unlike Post Error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select:
          "-password -email -followers -following -createdAt -updatedAt -link -bio",
      })
      .populate({
        path: "comments.user",
        select:
          "-password -email -followers -following -createdAt -updatedAt -link -bio",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Get All Posts Error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPosts = user.likedPosts;

    if (likedPosts.length === 0) {
      return res.status(200).json([]);
    }

    const likedPostsData = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select:
          "-password -email -followers -following -createdAt -updatedAt -link -bio",
      })
      .populate({
        path: "comments.user",
        select:
          "-password -email -followers -following -createdAt -updatedAt -link -bio",
      });

    return res.status(200).json(likedPostsData);
  } catch (error) {
    console.log("Liked POsts Error: ", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;

    if (following.length === 0) {
      return res.status(200).json([]);
    }

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select:
          "-password -email -followers -following -createdAt -updatedAt -link -bio",
      })
      .populate({
        path: "comments.user",
        select:
          "-password -email -followers -following -createdAt -updatedAt -link -bio",
      });

    return res.status(200).json(feedPosts);
  } catch (error) {
    console.error("Get Following Posts Error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select:
          "-password -email -followers -following -createdAt -updatedAt -link -bio",
      })
      .populate({
        path: "comments.user",
        select:
          "-password -email -followers -following -createdAt -updatedAt -link -bio",
      });

    return res.status(200).json(userPosts);
  } catch (error) {
    console.log("Get User Posts Error: ", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
