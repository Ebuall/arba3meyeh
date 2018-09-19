import assert from "assert";
import { unsafeDeleteAt, refine, isEmpty } from "fp-ts/lib/Array";
import { setIn, updateIn } from "immutable";
import { Socket } from "socket.io";
import { Card, dealDeck, User, mapNullable } from "../model";
import { max } from "fp-ts/lib/Ord";

export type Id = number;

export type Player = {
  user: User;
  socket: Socket;
};

export type Tuple4<T> = [T, T, T, T];

export enum GameState {
  Loading,
  Bids,
  Tricks,
  Over,
}

let gameid = 0;
const nulls = Object.freeze([null, null, null, null]) as Tuple4<null>;
const zeros = Object.freeze([0, 0, 0, 0]) as Tuple4<number>;
export function Match(players: Player[]): Match {
  assert.strictEqual(players.length, 4, "should be exactly 4 players");
  return {
    players: players as Tuple4<Player>,
    hands: dealDeck(),
    board: nulls,
    bids: zeros,
    bidsTaken: zeros,
    state: GameState.Bids,
    playerTurn: 0,
    id: gameid++,
  };
}
export type Match = {
  players: Tuple4<Player>;
  hands: Tuple4<Card[]>;
  board: Tuple4<Card | null>;
  bids: Tuple4<number>;
  bidsTaken: Tuple4<number>;
  state: GameState;
  playerTurn: number;
  id: Id;
};
function notNull<T>(a: T): a is Exclude<T, null | undefined> {
  return a != null;
}
function allReady(a: (any)[]) {
  return a.every(notNull);
}
function inc(n: number) {
  return n + 1;
}
function incTurn(game: Match) {
  return updateIn(game, ["playerTurn"], t => inc(t) % 4);
}
export function playCard(game: Match, player: number, card: number): Match {
  const actualCard = game.hands[player][card];
  const fromHand = updateIn(incTurn(game), ["hands", player], hand =>
    unsafeDeleteAt(card, hand),
  );
  const onBoard = setIn(fromHand, ["board", player], actualCard);
  if (allReady(onBoard.board)) {
    return playTrick(onBoard);
  }
  return onBoard;
}
function findHighest(board_: Match["board"]): number {
  const board = refine(board_, notNull);
  const highest = board.reduce(max(Card));
  const res = board.findIndex(c => c === highest);
  assert.notStrictEqual(res, -1, "should find winner");
  return res;
}
function playTrick(game: Match): Match {
  const winner = findHighest(game.board);
  console.log("winner", winner, game.board.map(mapNullable(Card.show)));
  const addWin = updateIn(game, ["bidsTaken", winner], inc);
  const clearBoard = setIn(addWin, ["board"], nulls);
  if (clearBoard.hands.every(isEmpty)) {
    return setIn(clearBoard, ["state"], GameState.Over);
  }
  return clearBoard;
}
export function setBid(game: Match, player: number, bid: number): Match {
  const afterBid = setIn(incTurn(game), ["bids", player], bid);
  if (afterBid.bids.every(b => !!b)) {
    return setIn(afterBid, ["state"], GameState.Tricks);
  }
  return afterBid;
}

export type PlayerState = {
  hand: Card[];
  others: number[];
  board: Match["board"];
  state: Match["state"];
  index: number;
  yourTurn: boolean;
  bids: Match["bids"];
  bidsTaken: Match["bidsTaken"];
};
export function derivePlayerState(
  { hands, board, state, bids, bidsTaken, playerTurn }: Match,
  index: number,
): PlayerState {
  const hand = hands[index];
  const others = unsafeDeleteAt(index, hands).map(h => h.length);
  const yourTurn = playerTurn == index;
  return {
    hand,
    others,
    board,
    state,
    index,
    yourTurn,
    bids,
    bidsTaken,
  };
}

export function calculateScore(bid: number, taken: number) {
  if (taken > bid) {
    return toPoints(bid);
  } else {
    return toPoints(taken) - toPoints(bid - taken);
  }
}
function toPoints(n: number) {
  if (n < 5) {
    return n;
  }
  if (n < 9) {
    return n * 2;
  }
  return n * 3;
}
