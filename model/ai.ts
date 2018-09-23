import { GameState, PlayerState } from "../backend/game";

/** Most general emitter */
interface Emitter {
  emit(event: string, ...args: any[]): void;
  on(event: string, cb: (a: any) => void): void;
}

function isMyTurn(data: Data) {
  return data.playerTurn === data.index;
}

type Data = PlayerState;
export class AI {
  constructor(private socket: Emitter) {}

  playCard = (data: Data, card = 0) => {
    if (!isMyTurn(data)) return;

    const cardToSend = data.hand[card];
    console.log("sending card", cardToSend);
    this.socket.emit("playCard", card);
  };

  submitBid = (data: Data, bid = data.index + 2) => {
    if (!isMyTurn(data)) return;

    console.log("submitting bid", bid);
    this.socket.emit("bid", bid);
  };

  makeAutoPlay = (data: Data) => {
    if (!isMyTurn(data)) return;

    switch (data.state) {
      case GameState.Bids:
        return this.submitBid(data);
      case GameState.Tricks:
        return this.playCard(data);
    }
  };
}
