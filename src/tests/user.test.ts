import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User, { IUser } from "../models/user_model";

let app: Express;
let userId = "";
let accessTokenCookie = "";

const user: IUser = {
  fullName: "Shir Eran",
  email: "ShirEran2@bla.com",
  password: "55555",
  imageUrl: "https://www.google.com",
};

beforeAll(async () => {
  app = await initApp();

  await User.deleteMany({ email: user.email });
  const response = await request(app).post("/auth/register").send(user);
  accessTokenCookie = response.headers["set-cookie"][1]
    .split(",")
    .map((item) => item.split(";")[0])
    .join(";");
  userId = response.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Get connected user tests", () => {
  test("Get Connected User succefully", async () => {
    const response = await request(app)
      .get("/user/connected")
      .send(userId)
      .set("Cookie", accessTokenCookie);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("fullName");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("imageUrl");
  });
});

describe("Update user tests", () => {
  test("Update user data succefully", async () => {
    const updatedUser = {
      fullName: "Shi Era",
      email: "ShiEra@bla.com",
      imageUrl: "https://www.google2.com",
    };

    const response = await request(app)
      .put(`/user/`)
      .send(updatedUser)
      .set("Cookie", accessTokenCookie);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("fullName", updatedUser.fullName);
    expect(response.body).toHaveProperty("email", updatedUser.email);
    expect(response.body).toHaveProperty("imageUrl", updatedUser.imageUrl);
  });
});
