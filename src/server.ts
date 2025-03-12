import initApp from "./app";
import https from "https";
import http from "http";
import fs from "fs";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

initApp().then((app) => {
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

      if (process.env.NODE_ENV !== "production") {
        http.createServer(app).listen(process.env.PORT);
      } else {
        const options = {
          key: fs.readFileSync("./client-key.pem"),
          cert: fs.readFileSync("./client-cert.pem"),
        };
        https.createServer(options, app).listen(process.env.PORT);
      }
});
