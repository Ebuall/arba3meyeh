import {
  initial,
  pending,
  RemoteData,
  success,
} from "@devexperts/remote-data-ts";
import * as React from "react";
import io from "socket.io-client";
import { PlayerState } from "../backend/game";
import { AI } from "../model/ai";
import { User } from "../model";

export type InitialProps = { onClick: () => void };
export type FailureProps = { err: string };
export type SuccessProps = {
  data: PlayerState;
  name: string;
  playCard: (n: number) => void;
  submitBid: (n: number) => void;
  leaveGame: () => void;
};
type Props = {
  user: User;
  url: string;
  delay: number;
  autoPlay: boolean;
  forceSolo: boolean;
  Initial: React.ComponentType<InitialProps>;
  Pending: React.ComponentType<any>;
  Failure: React.ComponentType<FailureProps>;
  Success: React.ComponentType<SuccessProps>;
};
type State = {
  data: RemoteData<string, PlayerState>;
};

/** React-native safe */
export class UserConnection extends React.Component<Props, State> {
  socket!: SocketIOClient.Socket;
  ai!: AI;
  state: State = { data: initial };
  componentDidMount() {
    this.connect();
  }
  componentDidUpdate() {
    const { autoPlay, delay } = this.props;
    autoPlay &&
      this.state.data.map(data => {
        setTimeout(this.ai.makeAutoPlay, delay, data);
      });
  }
  connect = () => {
    const {
      user: { name, id },
      url,
      forceSolo,
    } = this.props;
    console.log("connecting", name);
    const socket = io(url, {
      query: { name, id, forceSolo },
      // transports: ["websocket", "polling"],
    });
    this.socket = socket;
    this.setState({ data: pending });
    socket.on("connect", () => console.log(name, "connected"));
    socket.on("gameState", (data: PlayerState) => {
      this.setState({ data: success(data) });
    });
    this.ai = new AI(socket);
  };
  playCard = (card: number) => {
    this.state.data.map(d => this.ai.playCard(d, card));
  };
  submitBid = (bid: number) => {
    this.state.data.map(d => this.ai.submitBid(d, bid));
  };
  leaveGame = () => {
    this.socket.emit("gameLeave");
    this.socket.close();
    this.setState({ data: initial });
    console.log("leaving game");
  };
  componentWillUnmount() {
    this.leaveGame();
  }

  render() {
    const {
      user: { name },
      Initial,
      Pending,
      Failure,
      Success,
    } = this.props;
    const { data } = this.state;

    return data.fold<React.ReactNode>(
      <Initial onClick={this.connect} />,
      <Pending />,
      err => <Failure err={err} />,
      data => (
        <Success
          data={data}
          name={name}
          playCard={this.playCard}
          submitBid={this.submitBid}
          leaveGame={this.leaveGame}
        />
      ),
    );
  }
}
