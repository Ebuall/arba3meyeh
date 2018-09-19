require("dotenv").config();
import Express from "express";
import http from "http";
import opn from "opn";
import SocketIO from "socket.io";
import { connect } from "./clients";

const log = (msg: string) => (...args: any[]) => console.log(msg, ...args);

const app = Express();

const PORT = process.env.PORT;
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  const Bundler = require("parcel-bundler");
  app.use(new Bundler(__dirname + "/public/index.html", {}).middleware());
  opn("http://localhost:" + PORT + "/index.html");
}

const server = http.createServer(app);
const io = SocketIO(server);

io.on("connection", function(client) {
  client.on("error", log("some error"));
  client.on("disconnect", log("disconnect"));
  client.on("myping", start => client.emit("mypong", start));
  connect(client);
});

server.listen(PORT, log("server started on " + PORT));
