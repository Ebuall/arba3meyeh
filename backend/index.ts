import http from "http";
import Koa from "koa";
import SocketIO from "socket.io";
// import serve from "koa-static";
import { connect } from "./clients";
require("dotenv").config();

const log = (msg: string) => (...args: any[]) => console.log(msg, ...args);

const app = new Koa();
// app.use(serve("public"));

const server = http.createServer(app.callback());
const io = SocketIO(server);

io.on("connection", function(client) {
  client.on("error", log("some error"));
  client.on("disconnect", log("disconnect"));
  client.on("myping", start => client.emit("mypong", start));
  connect(client);
});

const PORT = process.env.PORT;
server.listen(PORT, log("server started on " + PORT));
