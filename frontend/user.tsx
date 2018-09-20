import {
  Button,
  Card as MaterialCard,
  CardActions,
  CardContent,
  CardHeader,
} from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";
import { updateIn } from "immutable";
import * as React from "react";
import io from "socket.io-client";
import { allScores, GameState, PlayerState } from "../backend/game";
import { Card, mapNullable } from "../model";
var stringify = require("json-stringify-pretty-compact");

type Props = {
  name: string;
  delay: number;
};
type State = {
  data: PlayerState | null;
  bid: number;
};

export class UserDebug extends React.Component<Props, State> {
  socket!: SocketIOClient.Socket;
  state: State = { data: null, bid: 2 };
  componentDidMount() {
    const { name } = this.props;
    this.socket = io("http://localhost:3555", { query: { name, id: name } });
    this.socket.on("connect", () => console.log(name, "connected"));
    this.socket.on("gameState", (data: PlayerState) => {
      this.setState({ data });
      setTimeout(() => {
        if (data.yourTurn)
          switch (data.state) {
            case GameState.Bids:
              return this.submitBid(null, data.index + 10);
            case GameState.Tricks:
              return this.playCard(null);
          }
      }, this.props.delay);
    });
  }
  playCard = (_: any, card = 0) => {
    const { data } = this.state;
    if (!data || !data.yourTurn) return;

    const cardToSend = this.state.data!.hand[card];
    console.log("sending card", cardToSend);
    this.socket.emit("playCard", card);
  };
  submitBid = (_: any, bid = this.state.bid) => {
    const { data } = this.state;
    if (!data || !data.yourTurn) return;
    console.log("submitting bid", bid);
    this.socket.emit("bid", bid);
  };
  handleSlider = (_ev: any, bid: number) => {
    return this.setState({ bid });
  };
  render() {
    const { name } = this.props;
    const { data, bid } = this.state;

    if (!data) return "Loading";
    const pretty = updateIn(
      updateIn(data, ["hand"], a => a.map(Card.show)),
      ["board"],
      a => a.map(mapNullable(Card.show)),
    );
    return (
      <MaterialCard>
        <CardHeader title={"Hello UserDebug " + name} />
        <CardContent>
          <pre>{stringify(pretty, { maxLength: 120 })}</pre>
          {data.state == GameState.Over && <h1>Game over </h1>}
          <pre>score {allScores(data)[data.index]}</pre>
        </CardContent>
        <CardActions>
          {data.state == GameState.Tricks && (
            <Button onClick={this.playCard}>Send card</Button>
          )}
          {data.state == GameState.Bids && (
            <div style={{ width: 300 }}>
              Your bid {bid}
              <Button onClick={this.submitBid}>Submit</Button>
              <Slider
                value={bid}
                min={2}
                max={13}
                step={1}
                onChange={this.handleSlider}
              />
            </div>
          )}
        </CardActions>
      </MaterialCard>
    );
  }
}
