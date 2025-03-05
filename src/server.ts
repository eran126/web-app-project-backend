import initApp from "./app";
import http from "http";
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
          servers: [{ url: "http://localhost:3000" }],
        },
        apis: ["./**/*.ts"],
      };
      const specs = swaggerJsDoc(options);
      app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

    console.log("listen on PORT: " + process.env.PORT);
    http.createServer(app).listen(process.env.PORT);
});
