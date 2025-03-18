import initApp from "./app";
import https from "https";
import http from "http";
import fs from "fs";

initApp().then((app) => {
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
