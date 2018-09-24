import { Action, Dispatch } from "redux";
import { Cmd } from "redux-loop";
const debug = require("debug")("server:loop");

export function scheduleAction(action: Action, delay: number) {
  return Cmd.run(
    (dispatch: Dispatch) => {
      setTimeout(dispatch, delay, action);
      debug("action %o scheduled in %d seconds", action, delay / 1000);
    },
    { args: [Cmd.dispatch] },
  );
}
