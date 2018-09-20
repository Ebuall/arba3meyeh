import { array, drop, take } from "fp-ts/lib/Array";
import { tuple } from "fp-ts/lib/function";
import { none, some } from "fp-ts/lib/Option";
import { fromCompare, ordNumber } from "fp-ts/lib/Ord";
import { Ordering } from "fp-ts/lib/Ordering";
import flatMap from "lodash/flatMap";
import range from "lodash/range";
import shuffle from "lodash/shuffle";
import { Tuple4 } from "../backend/game";

export enum Rank {
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
  Ace,
}
export namespace Rank {
  export const compare = ordNumber.compare;
  export const equals = ordNumber.equals;
  export function show(rank: Rank) {
    switch (rank) {
      case Rank.Jack:
        return "J";
      case Rank.Queen:
        return "Q";
      case Rank.King:
        return "K";
      case Rank.Ace:
        return "A";
      default:
        return String(rank + 2);
    }
  }
}
export enum Suit {
  Clubs,
  Diamonds,
  Hearts,
  Spades,
}
export namespace Suit {
  export function compare(s1: Suit, s2: Suit): Ordering {
    if (s1 == Suit.Hearts) {
      if (s2 == Suit.Hearts) {
        return 0;
      }
      return 1;
    }
    if (s2 == Suit.Hearts) {
      return -1;
    }
    return 0;
  }

  export const equals = fromCompare(compare).equals;

  export function isBlack(suit: Suit) {
    switch (suit) {
      case Suit.Clubs:
      case Suit.Spades:
        return true;
      default:
        return false;
    }
  }
  export function show(suit: Suit) {
    switch (suit) {
      case Suit.Clubs:
        return "♣";
      case Suit.Diamonds:
        return "♦";
      case Suit.Hearts:
        return "♥";
      case Suit.Spades:
        return "♠";
    }
  }
}

export type Card = [Rank, Suit];
export function Card(rank: Rank, suit: Suit): Card {
  return [rank, suit];
}
export namespace Card {
  export function isBlack(card: Card) {
    return Suit.isBlack(card[1]);
  }
  export function compare([r1, s1]: Card, [r2, s2]: Card) {
    const res1 = Suit.compare(s1, s2);
    if (res1 !== 0) {
      return res1;
    }

    return Rank.compare(r1, r2);
  }
  export const equals = fromCompare(compare).equals;
  export function show(card: Card) {
    return `${Rank.show(card[0])}${Suit.show(card[1])}`;
  }
}

// export function randomCard(): Card {
//   return [random(Rank.Two, Rank.Ace, false), random(0, 3)];
// }
type Deck = Card[];

export function draw([card, ...deck]: Deck) {
  return [card, deck];
}
export function drawN(n: number, deck: Deck) {
  return [deck.slice(0, n), deck.slice(n)];
}
export function drawNO(n: number, deck: Deck) {
  const hand = take(n, deck);
  if (hand.length) {
    return some(tuple(hand, drop(n, deck)));
  } else {
    return none;
  }
}

export const makeDeck = () =>
  shuffle(
    flatMap(range(Rank.Two, Rank.Ace + 1), rank =>
      range(0, 4).map(suit => Card(rank, suit)),
    ),
  );

export function dealDeck() {
  return array.unfoldr(makeDeck(), deck => drawNO(13, deck)) as Tuple4<Card[]>;
}
