import Comment, { IComment } from "../models/comment_model";
import Post from "../models/post_model";
import { BaseController } from "./base_controller";
import { Response } from "express";
import { AuthRequest } from "../common/auth_middleware";

class CommentController extends BaseController<IComment> {
  constructor() {
    super(Comment);
  }

  async post(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { text, postId } = req.body;
      const timestamp = new Date().toISOString();

      const post = await Post.findById(postId);

      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      const comment = await Comment.create({
        text,
        author: userId,
        postId: post.id,
        timestamp: timestamp
      });

      post.comments.push(comment.id);

      await post.save();
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error - Comment was not saved" });
    }
  }
}

export default new CommentController();
