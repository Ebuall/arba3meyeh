import { EventEmitter } from "events";
import { AI } from "../model/ai";
import { MySocket } from "./socket";
import { Range } from "immutable";
const debug = require("debug")("server:bots");

function spawnBot(name: string) {
  const socket = new EventEmitter() as MySocket;
  const user = { name, id: name };
  socket.handshake = { query: { ...user, forceSolo: false } };
  const ai = new AI(socket);
  socket.on("gameState", state => {
    // debug("state", state);
    setTimeout(ai.makeAutoPlay, 30, state);
  });
  return { user, socket };
}

export function makeBots(n = 3) {
  return Range(1, n + 1)
    .map(id => "Bot" + id)
    .map(spawnBot);
}
