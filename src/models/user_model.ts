import mongoose, { ObjectId } from "mongoose";

export interface IUser {
  _id?: ObjectId;
  fullName: string;
  email: string;
  password?: string;
  refreshTokens?: string[];
  imageUrl: string;
}

const userSchema = new mongoose.Schema<IUser>({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  refreshTokens: {
    type: [String],
    required: false,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

export default mongoose.model<IUser>("User", userSchema);
