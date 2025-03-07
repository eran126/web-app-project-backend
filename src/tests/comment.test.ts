import { Express } from "express";
import request from "supertest";
import initApp from "../app";
import mongoose, { ObjectId } from "mongoose";
import Comment, { IComment } from "../models/comment_model";
import User, { IUser } from "../models/user_model";
import Review, { IPost } from "../models/post_model";

let app: Express;
let accessTokenCookie = "";

const user: IUser = {
  fullName: "Eran Shir",
  email: "EranShir@bla.com",
  password: "55555",
  imageUrl: "https://www.google.com",
};

const post: IPost = {
  title: "Test Post",
  body: "Test Body",
  timestamp: new Date(),
  likes: [],
  comments: [],
  author: user._id,
};

const comment: IComment = {
  body: "test body",
  author: user._id,
  postId: post._id,
  timestamp: new Date(),
};

beforeAll(async () => {
  app = await initApp();

  await User.deleteMany({ email: user.email });
  const response = await request(app).post("/auth/register").send(user);
  accessTokenCookie = response.headers["set-cookie"][1]
    .split(",")
    .map((item) => item.split(";")[0])
    .join(";");
  const postedUser = await User.findOne({ email: user.email });
  user._id = postedUser.id;
  post.author = postedUser.id;
  comment.author = postedUser.id;

  const postedPost = await Review.create(post);
  post._id = postedPost._id;
  comment.postId = postedPost._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Post comment test", () => {
  const addComment = async (comment: IComment) => {
    const response = await request(app)
      .post("/comments/")
      .set("Cookie", accessTokenCookie)
      .send(comment);

    expect(response.statusCode).toBe(201);
    expect(response.body.author).toBe(user._id);
    expect(response.body.body).toBe(comment.body);
    expect(response.body.postId).toBe(post._id.toString());
  };

  test("Post comment test", async () => {
    await addComment(comment);
  });
});
