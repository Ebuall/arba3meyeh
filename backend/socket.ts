import { EventEmitter } from "events";
import { User } from "../model";

export interface MySocket extends EventEmitter {
  handshake: {
    query: User & { forceSolo: boolean };
  };
}
