import initApp from "../app";
import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import path from "path";

let app: Express;

beforeAll(async () => {
  app = await initApp();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("File Tests", () => {
  test("upload file expect ", async () => {
    const filePath = path.join(__dirname, "burger.png");
    console.log(filePath);

    try {
      const response = await request(app)
        .post("/file")
        .attach("file", filePath);
      expect(response.statusCode).toEqual(200);
      let url = response.body.url;
      console.log(url);
      url = url.replace(/^.*\/\/[^/]+/, "");
      const res = await request(app).get(url);
      expect(res.statusCode).toEqual(200);
    } catch (err) {
      console.log(err);
      expect(1).toEqual(2);
    }
  });
});
