import mongoose, { ObjectId } from "mongoose";

export interface IPost {
  _id?: ObjectId;
  title: string;
  body: string;
  author: ObjectId;
  timestamp: Date;
  likes: string[];
  comments: ObjectId[];
  isLiked?: boolean;
  likesCount?: number;
}

const postSchema = new mongoose.Schema<IPost>({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  likes: {
    type: [String],
    default: [],
    required: true,
  },
  comments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Comment",
    default: [],
    required: true,
  },
});

export default mongoose.model<IPost>("Post", postSchema);
