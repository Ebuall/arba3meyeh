import assert from "assert";
import { isEmpty, refine, unsafeDeleteAt, zipWith } from "fp-ts/lib/Array";
import { max } from "fp-ts/lib/Ord";
import { setIn, updateIn } from "immutable";
import { Socket } from "socket.io";
import { Card, dealDeck, mapNullable, User } from "../model";
import { Id } from "./game";

export type Id = number;

export type Tuple4<T> = [T, T, T, T];

export enum GameState {
  Loading,
  Bids,
  Tricks,
  Over,
}

export type Player = {
  user: User;
  socket: Socket;
  gameId: Id;
  index: number;
};

let gameid = 0;
const nulls = Object.freeze([null, null, null, null]) as Tuple4<null>;
const zeros = Object.freeze([0, 0, 0, 0]) as Tuple4<number>;
export function Match(players: User[]): Match {
  assert.strictEqual(players.length, 4, "should be exactly 4 players");
  return {
    players: players as Tuple4<User>,
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
  players: Tuple4<User>;
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
function putCard(game: Match, player: number, card: number): Match {
  const actualCard = game.hands[player][card];
  const fromHand = updateIn(incTurn(game), ["hands", player], hand =>
    unsafeDeleteAt(card, hand),
  );
  const onBoard = setIn(fromHand, ["board", player], actualCard);
  return onBoard;
}
function endGame(game: Match) {
  return setIn(game, ["state"], GameState.Over);
}
function isEnoughScore(game: Match) {
  return allScores(game).some(v => v > 41);
}
function newDeal(game: Match) {
  return setIn(game, ["hands"], dealDeck());
}
export function playCard(game: Match, player: number, card: number): Match {
  const cardPlayed = putCard(game, player, card);

  if (!allReady(cardPlayed.board)) return cardPlayed;

  const cleanBoard = playTrick(cardPlayed);

  if (isEnoughScore(cleanBoard)) return endGame(cleanBoard);
  if (!cleanBoard.hands.every(isEmpty)) return cleanBoard;

  const newDeck = newDeal(cleanBoard);
  return newDeck;
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
export function allScores(s: Pick<Match, "bids" | "bidsTaken">) {
  return zipWith(s.bids, s.bidsTaken, calculateScore);
}
function toPoints(n: number) {
  if (n < 5) {
    return n;
  }
  if (n < 9) {
    return n * 2;
  }
  if (n < 11) {
    return n * 3;
  }
  return n * 4;
}
