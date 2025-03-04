import initApp from "./app";
import http from "http";

initApp().then((app) => {
    console.log("listen on PORT: " + process.env.PORT);
    http.createServer(app).listen(process.env.PORT);
});
