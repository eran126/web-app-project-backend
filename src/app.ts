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
import aiRoute from "./routes/ai_route";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

var cors = require("cors");

const initApp = (): Promise<Express> => {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.once("open", () => console.log("Connected to Database"));
    db.on("error", (error) => console.error(error));
    const dbUrl = process.env.DB_URL;
    mongoose.connect(dbUrl!).then(() => {
    const corsOptions = {
        origin:
            process.env.NODE_ENV !== "production"
            ? `http://${process.env.DOMAIN_BASE}:5173`
            : `https://${process.env.DOMAIN_BASE}`,
        credentials: true,
        };

      const app = express();
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      app.use(cors(corsOptions));
      app.use(cookieParser());
      app.use("/public", express.static("public"));
      app.use("/auth", authRoute);
      app.use("/file", fileRoute);
      app.use("/posts", postRoute);
      app.use("/comments", commentRoute);
      app.use("/user", userRoute);
      app.use("/ai", aiRoute);
      app.use(express.static("front"));

      const options = {
        definition: {
          openapi: "3.0.0",
          info: {
            title: "FoodieBook! REST API",
            version: "1.0.0",
            description:
              "REST server of the FoodieBook application",
          },
          servers: [
            { url: `https://${process.env.DNS}`},
            { url: "http://localhost:3000" },
            { url: "http://10.10.246.15" },
            { url: "https://10.10.246.15" }
          ],
        },
        apis: ["./**/*.ts"],
      };
      const specs = swaggerJsDoc(options);
      app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

      // Catch-all route for handling front-end routing in a SPA
      app.get("*", (req, res) => {
        res.sendFile("index.html", { root: "front" });
      });

      resolve(app);
    });
  });
  return promise;
};

export default initApp;
