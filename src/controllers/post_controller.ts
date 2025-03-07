import Post, { IPost } from "../models/post_model";
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
      const posts = await Post.find()
        .select([
          "title",
          "body",
          "timestamp",
          "likes",
          "comments",
        ])
        .populate([{ path: "author", select: "fullName imageUrl" }])
        .sort({ timestamp: -1 });
      const detailedPosts = posts
        .map((post) => post.toObject())
        .map(({ _id, likes, ...post }) => ({
          ...post,
          id: _id,
          likes: likes.length,
          isLiked: likes.includes(req.user._id),
        }));

      res.send(detailedPosts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const post = await Post.findById(req.params.id)
        .populate([{ path: "author", select: "fullName imaegUrl" }])
        .populate({
          path: "comments",
          select: "body timestamp author postId",
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

  async like(req: AuthRequest, res: Response) {
    const postId = req.params.id;
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
    const postId = req.params.id;
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
          "title",
          "body",
          "timestamp",
          "likes",
          "comments",
        ])
        .populate([{ path: "author", select: "fullName imageUrl" }])
        .sort({ timestamp: -1 });
      const detailedPosts = posts
        .map((post) => post.toObject())
        .map(({ _id, likes, ...post }) => ({
          ...post,
          id: _id,
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
    req.body.author = userId;

    super.post(req, res);
  }

  async putById(req: AuthRequest, res: Response) {
    super.putById(req, res);
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
