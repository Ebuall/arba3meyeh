import assert from "assert";
import { isEmpty, refine, unsafeDeleteAt, zipWith } from "fp-ts/lib/Array";
import { max } from "fp-ts/lib/Ord";
import { set, setIn, updateIn } from "immutable";
import { Card, dealDeck, mapNullable, User } from "../model";
import { MySocket } from "./socket";
import { Id } from "./game";

export type Id = number | string;

export type Tuple4<T> = [T, T, T, T];

export enum GameState {
  Loading,
  Bids,
  Tricks,
  Over,
}

export enum Team {
  None,
  Red,
  Blue,
}
export namespace Team {
  export function fromIndex(playerIndex: number) {
    switch (playerIndex) {
      case 0:
      case 2:
        return Team.Red;
      case 1:
      case 3:
        return Team.Blue;
      default:
        return Team.None;
    }
  }
  export function flip(t: Team) {
    switch (t) {
      case Team.Blue:
        return Team.Red;
      case Team.Red:
        return Team.Blue;

      default:
        return Team.None;
    }
  }
}

export type Player = {
  user: User;
  socket: MySocket;
  gameId: Id;
  index: number;
};

let gameid = 0;
const nulls = Object.freeze([null, null, null, null]) as Tuple4<null>;
const zeros = Object.freeze([0, 0, 0, 0]) as Tuple4<number>;

export type Match = ReturnType<typeof Match>;
export function Match(players: User[]) {
  assert.strictEqual(players.length, 4, "should be exactly 4 players");
  return {
    players: players as Tuple4<User>,
    hands: dealDeck(),
    board: nulls as Tuple4<Card | null>,
    bids: zeros,
    bidsTaken: zeros,
    scores: zeros,
    state: GameState.Bids,
    playerTurn: 0,
    id: gameid++,
    winner: Team.None,
  };
}

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
export function endGame(game: Match, winner: Team) {
  return {
    ...game,
    state: GameState.Over,
    winner,
  };
}

function findWinner(game: Match) {
  const id = game.scores.findIndex(v => v >= 41);
  return Team.fromIndex(id);
}
function newDeal(game: Match) {
  return {
    ...game,
    hands: dealDeck(),
    bids: zeros,
    bidsTaken: zeros,
    scores: zipWith(
      game.scores,
      allScores(game),
      (s1, s2) => s1 + s2,
    ) as Tuple4<number>,
    state: GameState.Bids,
  };
}
export function playCard(game: Match, player: number, card: number): Match {
  const cardPlayed = putCard(game, player, card);

  if (!allReady(cardPlayed.board)) return cardPlayed;

  const cleanBoard = playTrick(cardPlayed);

  const winner = findWinner(cleanBoard);
  if (winner) return endGame(cleanBoard, winner);
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
  // console.log("winner", winner, game.board.map(mapNullable(Card.show)));
  const addWin = updateIn(game, ["bidsTaken", winner], inc);
  const clearBoard = set(addWin, "board", nulls);
  return clearBoard;
}
export function setBid(game: Match, player: number, bid: number): Match {
  const afterBid = setIn(incTurn(game), ["bids", player], bid);
  if (afterBid.bids.every(b => !!b)) {
    return set(afterBid, "state", GameState.Tricks);
  }
  return afterBid;
}

export type PlayerState = ReturnType<typeof derivePlayerState>;
export function derivePlayerState(
  { hands, players, id, ...game }: Match,
  index: number,
) {
  const hand = hands[index];
  const others = unsafeDeleteAt(index, hands).map(h => h.length);
  const res = {
    hand,
    others,
    index,
    gameId: id,
    ...game,
  };
  return res;
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
