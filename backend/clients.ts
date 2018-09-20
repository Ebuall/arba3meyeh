import { tuple } from "fp-ts/lib/function";
import { List, Map } from "immutable";
import pick from "lodash/pick";
import { Socket } from "socket.io";
import { Ref, User } from "../model";
import {
  derivePlayerState,
  Id,
  Match,
  playCard,
  Player,
  setBid,
  GameState,
} from "./game";

type Queued = Pick<Player, "user" | "socket">;

let queue = List.of<Queued>();
let games = Map<Id, Ref<Match>>();
let connections = Map<User["id"], Player>();

export function connect(socket: Socket) {
  const user: User = pick(socket.handshake.query, ["id", "name"]);

  const alreadyConnected = connections.get(user.id);
  console.log("connecteding", user, !!alreadyConnected);
  if (alreadyConnected) {
    connections = connections.setIn([user.id, "socket"], socket);
    connectPlayer(user);
    sendState(games.get(alreadyConnected.gameId)!.val);
    return;
  }

  queue = queue.push({ user, socket });

  if (queue.size >= 4) {
    const players = queue.take(4);
    startGame(players.toArray());
    queue = queue.skip(4).toList();
  }

  socket.on("disconnect", () => {
    queue = queue.filterNot(p => p.user.name == user.name).toList();
  });
}

function sendState(game: Match) {
  game.players.forEach((p, i) => {
    connections.get(p.id)!.socket.emit("gameState", derivePlayerState(game, i));
  });
}

function startGame(queued: Queued[]) {
  const users = queued.map(p => p.user);
  console.log("starting", users);
  const newGame = Match(users);
  const game = new Ref(newGame);
  connections = connections.merge(
    queued.map((p, i) =>
      tuple(p.user.id, { ...p, gameId: newGame.id, index: i }),
    ),
  );
  games = games.set(newGame.id, game);
  newGame.players.forEach(connectPlayer);
  sendState(game.val);
}

function connectPlayer(user: User) {
  const { socket, gameId, index } = connections.get(user.id)!;
  const game = games.get(gameId)!;
  socket.on("bid", (bid: number) => {
    if (game.val.playerTurn != index) return;
    console.log("got bid from", user.name, index, bid);
    game.upd(val => setBid(val, index, bid));
    sendState(game.val);
  });

  socket.on("playCard", (card: number) => {
    if (game.val.playerTurn != index) return;
    // console.log("got card from", user.name, index, card);
    game.upd(val => playCard(val, index, card));
    sendState(game.val);

    if (game.val.state === GameState.Over) {
      setTimeout(() => {
        games = games.delete(game.val.id);
        game.val.players.forEach(u => {
          const p = connections.get(u.id);
          if (p && p.gameId == game.val.id) {
            connections = connections.delete(u.id);
          }
        });
        console.log("cleaning up, game:", game.val.id, "games running:", games.size);
      }, 30 * 1000);
    }
  });
}
