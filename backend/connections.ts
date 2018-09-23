import { tuple } from "fp-ts/lib/function";
import { set, setIn, update } from "immutable";
import pick from "lodash/pick";
import { Dispatch } from "redux";
import { Cmd, loop } from "redux-loop";
import { User, parseBool } from "../model";
import { makeBots } from "./bots";
import { Action, Coords, State } from "./ducks";
import { Match, Player } from "./game";
import { MySocket } from "./socket";
const debug = require("debug")("server:players");

type Queued = Pick<Player, "user" | "socket">;

export function connect(state: State, socket: MySocket) {
  const user: User = pick(socket.handshake.query, ["id", "name"]);

  const alreadyConnected = state.connections.get(user.id);
  debug("user", user, !!alreadyConnected);
  if (alreadyConnected) {
    return loop(
      setIn(state, ["connections", user.id, "socket"], socket),
      Cmd.run(connectPlayer, { args: [user, Cmd.getState, Cmd.dispatch] }),
    );
  }

  const forceSolo = socket.handshake.query.forceSolo;
  if (parseBool(forceSolo)) {
    const bots = makeBots().toArray();
    console.log({ bots });
    return startGame(state, [{ user, socket }].concat(bots));
  }

  const updated = state.queue.set(user.id, { user, socket });
  if (updated.size < 4) {
    return set(state, "queue", updated);
  }
  const players = updated.take(4);
  const cleaned = updated.skip(4).toOrderedMap();
  const state1 = set(state, "queue", cleaned);
  return startGame(state1, players.valueSeq().toArray());
}

type ConstState = () => State;
function startGame(state: State, queued: Queued[]) {
  const users = queued.map(p => p.user);
  debug("starting", users);
  const newGame = Match(users);
  const addedGame = setIn(state, ["games", newGame.id], newGame);
  const addedConnections = update(addedGame, "connections", cs =>
    cs.merge(
      queued.map((p, i) =>
        tuple(p.user.id, { ...p, gameId: newGame.id, index: i }),
      ),
    ),
  );
  return loop(
    addedConnections,
    Cmd.run(
      (getState: ConstState, dispatch: Dispatch) => {
        newGame.players.forEach(u => connectPlayer(u, getState, dispatch));
      },
      { args: [Cmd.getState, Cmd.dispatch] },
    ),
  );
}

function connectPlayer(user: User, getState: ConstState, dispatch: Dispatch) {
  const state = getState();
  debug("connectPlayer");
  const { socket, gameId, index } = state.connections.get(user.id)!;
  socket.on("bid", (bid: number) => {
    const game = getState().games.get(gameId)!;
    if (game.playerTurn != index) return;
    // debug("bid", user.name, index, bid);
    dispatch(Action.Bid([new Coords(game.id, index), bid]));
  });

  socket.on("playCard", (card: number) => {
    const game = getState().games.get(gameId)!;
    if (game.playerTurn != index) return;
    // debug("card", user.name, index, card);
    dispatch(Action.Card([new Coords(game.id, index), card]));
  });

  socket.on("gameLeave", () => {
    dispatch(Action.GameLeave(new Coords(gameId, index)));
  });
}
