import { Map, OrderedMap, removeIn, setIn, updateIn } from "immutable";
import { Dispatch } from "redux";
import { Cmd, Loop, loop } from "redux-loop";
import { ofType, unionize, UnionOf } from "unionize";
import { connect } from "./connections";
import {
  endGame,
  GameState,
  Id,
  Match,
  Player,
  setBid,
  Team,
  putCard,
  allReady,
  handleFull,
} from "./game";
import { MySocket } from "./socket";
import { scheduleAction } from "./loop";
const debug = require("debug")("server:ducks");

export class Coords {
  constructor(readonly gameId: Id, readonly userIndex: number) {}
}
export type Action = UnionOf<typeof Action>;
export const Action = unionize(
  {
    Connect: ofType<MySocket>(),
    Disconnect: ofType<Id>(),
    Bid: ofType<[Coords, number]>(),
    Card: ofType<[Coords, number]>(),
    HandleFullBoard: ofType<Id>(),
    GameDeleteSchedule: ofType<Id>(),
    GameDelete: ofType<Id>(),
    GameLeave: ofType<Coords>(),
  },
  { tag: "type", value: "payload" },
);

type Queued = Pick<Player, "user" | "socket">;
export type State = ReturnType<typeof getInitialState>;
function getInitialState() {
  return {
    // queue: List.of<Queued>(),
    queue: OrderedMap<Id, Queued>([]),
    games: Map<Id, Match>(),
    connections: Map<Id, Player>(),
  };
}

type LoopReturn<T> = T | Loop<T, any>;

export function reducer(
  state = getInitialState(),
  action: Action,
): LoopReturn<State> {
  const res = Action.match(action, {
    Connect: socket =>
      connect(
        state,
        socket,
      ),
    Bid: ([{ gameId, userIndex }, bid]) =>
      updateIn(state, ["games", gameId], game => setBid(game, userIndex, bid)),
    Card: ([{ gameId, userIndex }, card]) => {
      const game = state.games.get(gameId);
      if (
        !game ||
        game.state === GameState.Over ||
        !game.bids.every(b => b >= 2)
      ) {
        // debug("missing game", action.payload);
        return state;
      }
      const cardPlayed = putCard(game, userIndex, card);
      const newState = setIn(state, ["games", gameId], cardPlayed);

      return loop(
        newState,
        allReady(cardPlayed.board)
          ? scheduleAction(Action.HandleFullBoard(game.id), 3000)
          : Cmd.none,
      );
    },
    HandleFullBoard: id => {
      const game = state.games.get(id);
      if (!game || !allReady(game.board)) return state;

      return updateIn(state, ["games", id], handleFull);
    },
    GameDeleteSchedule: id => {
      return loop(
        state,
        Cmd.run(
          (dispatch: Dispatch) => {
            const secs = 15;
            setTimeout(dispatch, secs * 1000, Action.GameDelete(id));
            debug("game %d will be deleted in %d seconds", id, secs);
          },
          { args: [Cmd.dispatch] },
        ),
      );
    },
    GameDelete: id => {
      const game = state.games.get(id)!;
      if (!game) return state;
      return {
        ...state,
        games: state.games.delete(id),
        connections: state.connections.filterNot(p => p.gameId == id),
      };
    },
    GameLeave: ({ gameId, userIndex }) => {
      const game = state.games.get(gameId);
      debug("leaving game", gameId, userIndex);
      if (!game) return state;

      const discon = removeIn(state, [
        "connections",
        game.players[userIndex].id,
      ]);
      if (game.state == GameState.Over) return discon;

      const winners = Team.flip(Team.fromIndex(userIndex));
      const end = setIn(discon, ["games", gameId], endGame(game, winners));

      return loop(end, Cmd.action(Action.GameDeleteSchedule(gameId)));
    },
    default: _ => state,
  });
  debug("reducer", action.type);
  return res;
}
