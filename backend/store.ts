import { createStore, Store } from "redux";
import { install } from "redux-loop";
import { reducer, State } from "./ducks";
import { derivePlayerState } from "./game";
const debug = require("debug")("server:store");

export const store: Store<State> = createStore(reducer as any, install());

store.subscribe(() => {
  const state = store.getState();
  state.games.forEach(game =>
    game.players.forEach((p, i) => {
      const connection = state.connections.get(p.id)!;
      if (connection)
        connection.socket.emit("gameState", derivePlayerState(game, i));
    }),
  );
  // return debug("updated")
});
