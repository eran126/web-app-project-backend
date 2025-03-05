import mongoose, { ObjectId } from "mongoose";

export interface IComment {
  _id?: ObjectId;
  body: string;
  author: ObjectId;
  postId: ObjectId;
  timestamp: Date;
}

const commentSchema = new mongoose.Schema<IComment>({
  body: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export default mongoose.model<IComment>("Comment", commentSchema);
