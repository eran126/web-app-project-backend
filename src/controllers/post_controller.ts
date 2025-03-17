import Post, { IPost } from "../models/post_model";
import User from "../models/user_model";
import Comment from "../models/comment_model";
import { BaseController } from "./base_controller";
import { Response } from "express";
import { AuthRequest } from "../common/auth_middleware";

class PostController extends BaseController<IPost> {
  constructor() {
    super(Post);
  }

  async get(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 10; // Always return 10 posts per page
      const skip = (page - 1) * limit;

      const posts = await Post.find()
        .select([
          "text",
          "image",
          "timestamp",
          "likes",
          "comments",
        ])
        .populate([{ path: "author", select: "fullName email imageUrl" }])
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const detailedPosts = posts
        .map((post) => post.toObject())
        .map(({ _id, likes, ...post }) => ({
          ...post,
          _id: _id,
          likes: likes.length,
          isLiked: likes.includes(req.user._id),
        }));

      res.json({
        currentPage: page,
        posts: detailedPosts});
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async like(req: AuthRequest, res: Response) {
    const userId = req.user._id;

    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.likes.includes(userId)) {
        return res.status(400).json({ message: "Post is already liked" });
      }

      post.likes.push(userId);
      await post.save();
      res.status(201).json({ message: "Post liked" });
    } catch (error) {
      res.status(500).json({ message: "Could not like post" });
    }
  }

  async unlike(req: AuthRequest, res: Response) {
    const userId = req.user._id;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.likes.includes(userId)) {
      return res.status(400).json({ message: "Post already unliked" });
    }

    post.likes = post.likes.filter((id) => id !== userId);
    await post.save();
    res.status(201).json({ message: "Post unliked" });
  }

  async getByConnectedUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;

    if (userId == null) return res.sendStatus(401);

    try {
      const posts = await Post.find({ author: userId })
        .select([
          "text",
          "image",
          "timestamp",
          "likes",
          "comments",
        ])
        .populate([{ path: "author", select: "fullName email imageUrl" }])
        .sort({ timestamp: -1 });
      const detailedPosts = posts
        .map((post) => post.toObject())
        .map(({ _id, likes, ...post }) => ({
          ...post,
          _id: _id,
          likes: likes.length,
          isLiked: likes.includes(req.user._id),
        }));

      res.send(detailedPosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async post(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    req.body.author = await User.findById(userId).select([
      "fullName",
      "email",
      "imageUrl",
    ]);
  
    req.body.timestamp = new Date().toISOString();

    super.post(req, res);
  }

  async putById(req: AuthRequest, res: Response) {
    req.body.timestamp = new Date().toISOString();

    super.putById(req, res);
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const post = await Post.findById(req.params.id)
        .populate([{ path: "author", select: "fullName imaegUrl" }])
        .populate({
          path: "comments",
          select: "text timestamp author postId",
          populate: { path: "author", select: "fullName imageUrl" },
        });

      if (!post) {
        res.status(404).json({ message: "Post not found" });
      }

      res.status(201).send(post);
    } catch (error) {
      res.status(404).json({ message: "Post not found" });
    }
  }

  async deleteById(req: AuthRequest, res: Response) {
    try {
      await Comment.deleteMany({ postId: req.params.id });
    } catch (error) {
      res.status(500).json({ message: "Comments could not be deleted" });
    }
    super.deleteById(req, res);
  }
}

export default new PostController();
