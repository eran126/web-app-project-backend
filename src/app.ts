import env from "dotenv";
env.config();

import express, { Express } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import authRoute from "./routes/auth_route";
import fileRoute from "./routes/file_route";
import postRoute from "./routes/post_route";
import commentRoute from "./routes/comment_route";
import userRoute from "./routes/user_route";

var cors = require("cors");

const initApp = (): Promise<Express> => {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.once("open", () => console.log("Connected to Database"));
    db.on("error", (error) => console.error(error));
    const dbUrl = process.env.DB_URL;
    mongoose.connect(dbUrl!).then(() => {
      const app = express();
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      app.use(cookieParser());
      app.use("/public", express.static("public"));
      app.use("/auth", authRoute);
      app.use("/file", fileRoute);
      app.use("/posts", postRoute);
      app.use("/comments", commentRoute);
      app.use("/user", userRoute);

      resolve(app);
    });
  });
  return promise;
};

export default initApp;
