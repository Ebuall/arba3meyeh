import {
  initial,
  pending,
  RemoteData,
  remoteData,
  success,
} from "@devexperts/remote-data-ts";
import { sequenceT } from "fp-ts/lib/Apply";
import * as React from "react";
import io from "socket.io-client";
import { GameInfo, PlayerState } from "../backend/game";
import { User } from "../model";
import { AI } from "../model/ai";

export type InitialProps = { onClick: () => void };
export type FailureProps = { err: string };
export type SuccessProps = {
  data: PlayerState;
  info: GameInfo;
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
  info: RemoteData<string, GameInfo>;
};

/** React-native safe */
export class UserConnection extends React.Component<Props, State> {
  socket!: SocketIOClient.Socket;
  ai!: AI;
  state: State = { data: initial, info: initial };
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
    this.setState({ data: pending, info: pending });
    socket.on("connect", () => console.log(name, "connected"));
    socket.on("gameState", (data: PlayerState) => {
      this.setState({ data: success(data) });
    });
    socket.on("gameInfo", (info: GameInfo) => {
      this.setState({ info: success(info) });
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
    const { data, info } = this.state;

    return sequenceT(remoteData)(data, info).fold<React.ReactNode>(
      <Initial onClick={this.connect} />,
      <Pending />,
      err => <Failure err={err} />,
      ([data, info]) => (
        <Success
          data={data}
          info={info}
          name={name}
          playCard={this.playCard}
          submitBid={this.submitBid}
          leaveGame={this.leaveGame}
        />
      ),
    );
  }
}
