import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import Post, { IPost } from "../models/post_model";
import User, { IUser } from "../models/user_model";

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

beforeAll(async () => {
  app = await initApp();

  await User.deleteMany({ email: user.email });
  const response = await request(app).post("/auth/register").send(user);
  user._id = response.body._id;
  accessTokenCookie = response.headers["set-cookie"][1]
    .split(",")
    .map((item) => item.split(";")[0])
    .join(";");
  const postedUser = await User.findOne({ email: user.email });
  user._id = postedUser._id;
  post.author = user._id;
  const postedPost = await Post.create(post);
  post._id = postedPost._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Get posts test", () => {
  test("Get Posts", async () => {
    const response = await request(app)
      .get("/posts/")
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty("title", post.title);
    expect(response.body[0]).toHaveProperty("body", post.body);
    expect(response.body[0]).toHaveProperty("likes", post.likes.length);
    expect(response.body[0]).toHaveProperty("isLiked", false);
  });

  test("Get Posts - User not authenticated", async () => {
    const response = await request(app).get("/posts/");
    expect(response.statusCode).toBe(401);
  });
});

describe("Get post by id tests", () => {
  test("Get Post", async () => {
    const response = await request(app)
      .get(`/posts/id/${post._id}`)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("title", post.title);
    expect(response.body).toHaveProperty("body", post.body);
  });

  test("Post not found", async () => {
    const response = await request(app)
      .get(`/posts/id/12345`)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(404);
  });
});

describe("Like posts tests", () => {
  test('Liked Succesfully', async () => {
    const response = await request(app)
      .get(`/posts/like/${post._id}`)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("message", "Post liked");
  });

  test('Post already liked"', async () => {
    const response = await request(app)
      .get(`/posts/like/${post._id}`)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Post is already liked");
  });

  test("Post not found", async () => {
    const response = await request(app)
      .post(`/posts/like/12345`)
      .send(user)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(404);
  });
});

describe("Unlike post tests", () => {
  test('Unliked succefully', async () => {
    await request(app)
      .get(`/posts/like/${post._id}`)
      .send(user)
      .set("Cookie", accessTokenCookie);

    const response = await request(app)
      .get(`/posts/unlike/${post._id}`)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("message", "Post unliked");
  });

  test('Post already Unliked', async () => {
    const response = await request(app)
      .get(`/posts/unlike/${post._id}`)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Post already unliked");
  });

  test("Post not found", async () => {
    const response = await request(app)
      .post(`/posts/unlike/12345`)
      .send(user)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(404);
  });
});

describe("Get posts by connected user tests", () => {
  test("get posts by the connected user", async () => {
    const response = await request(app)
      .get("/posts/connectedUser")
      .send(user)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty("title", post.title);
    expect(response.body[0]).toHaveProperty("body", post.body);
    expect(response.body[0]).toHaveProperty("likes", post.likes.length);
    expect(response.body[0]).toHaveProperty("isLiked", false);
  });

  test("User is not authenticated", async () => {
    const response = await request(app)
      .get("/posts/connectedUser")
      .send(null);
    expect(response.statusCode).toBe(401);
  });
});

describe("Add posts tests", () => {
  const addPost = async (post: IPost) => {

    const { _id, ...postWithNoId } = post;
    const response = await request(app)
      .post("/posts")
      .send(postWithNoId)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("title", post.title);
    expect(response.body).toHaveProperty("body", post.body);
    expect(response.body).toHaveProperty("likes", post.likes);
    expect(response.body).toHaveProperty("author", user._id.toString());
  };
  test("Create Post", async () => {
    await addPost(post);
  });

  test("Post data is missing", async () => {
    const response = await request(app)
      .post("/posts")
      .send({})
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).not.toBe(201);
  });

  test("User is not authenticated", async () => {
    const response = await request(app).post("/posts").send(post);
    expect(response.statusCode).not.toBe(201);
  });
});

describe("Update Post by id tests", () => {
  test("Update Post successfully", async () => {
    const updatedPost: IPost = {
      ...post,
    };
    const response = await request(app)
      .put(`/posts/${post._id}`)
      .send(updatedPost)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(200);
  });

  test("Post data is missing", async () => {
    const response = await request(app)
      .put(`/posts/13+${post._id}`)
      .send({})
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(500);
  });

  test("User is not authenticated", async () => {
    const response = await request(app)
      .put(`/posts/id/${post._id}`)
      .send(post);
    expect(response.statusCode).not.toBe(200);
  });

  test("Post not found", async () => {
    const response = await request(app)
      .put(`/posts/id/12345`)
      .send(post)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(404);
  });
});

describe("Delete Post by id tests", () => {
  test("Post successfully deleted", async () => {
    const response = await request(app)
      .delete(`/posts/${post._id}`)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).toBe(200);
  });

  test("User is not authenticated", async () => {
    const response = await request(app).delete(`/posts/id/${post._id}`);
    expect(response.statusCode).not.toBe(200);
  });

  test("Post is not found", async () => {
    const response = await request(app)
      .delete(`/posts/id/12345`)
      .set("Cookie", accessTokenCookie);
    expect(response.statusCode).not.toBe(200);
  });
});
