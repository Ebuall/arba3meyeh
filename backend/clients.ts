import { List } from "immutable";
import omit from "lodash/omit";
import { Socket } from "socket.io";
import { Match, Player, derivePlayerState, playCard, setBid } from "./player";
import { User, Card } from "../model";

let queue = List.of<Player>();
let games = List.of<Ref<Match>>();

const getName = (p: Player) => p.user.name;
const getId = (p: User) => p.name;

function connectSpectator(socket: Socket) {
  const noSocket = games.map(get).map(g => omit(g, ["players"]));
  socket.on("inspect", ack => {
    console.log("ack", noSocket.toJSON());
    ack(noSocket.toArray());
  });
}

export function connect(client: Socket) {
  const username = client.handshake.query.name;
  if (username === "$DEBUG") {
    return connectSpectator(client);
  }
  console.log("connected", username);
  queue = queue.push({
    user: { name: username },
    socket: client,
  });

  if (queue.size >= 4) {
    startGame(queue.take(4).toArray());
    queue = queue.skip(4).toList();
  }

  client.on("disconnect", () => {
    queue = queue.filterNot(p => p.user.name == username).toList();
  });
}

function startGame(players: Player[]) {
  console.log("starting", players.map(getName));
  const newGame = Match(players);
  const game = ref(newGame);
  games = games.push(game);

  function sendState() {
    game.val.players.forEach((p, i) => {
      p.socket.emit("gameState", derivePlayerState(game.val, i));
    });
  }

  newGame.players.forEach((p, i) => {
    p.socket.on("bid", (bid: number) => {
      if (game.val.playerTurn != i) return;
      console.log("got bid from", getName(p), i, bid);
      game.val = setBid(game.val, i, bid);
      sendState();
    });

    p.socket.on("playCard", (card: number) => {
      if (game.val.playerTurn != i) return;
      console.log("got card from", getName(p), i, card);
      game.val = playCard(game.val, i, card);
      sendState();
    });
  });

  sendState();
}

type Ref<T> = { val: T };
function ref<T>(val: T): Ref<T> {
  return { val };
}
function upd<T>(f: (val: T) => T) {
  return (ref: Ref<T>) => {
    ref.val = f(ref.val);
    return ref;
  };
}
function get<T>(ref: Ref<T>) {
  return ref.val;
}

// setInterval(() => {
//   let deck = makeDeck();
//   queue.forEach(entry => {
//     const [hand, newDeck] = drawN(5, deck);
//     deck = newDeck;
//     entry!.socket.emit("newData", hand);
//   });
//   console.log("queue", queue.map(getName));
// }, 5000);
