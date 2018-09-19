import { none, some } from "fp-ts/lib/Option";
import * as React from "react";
import { Text, View } from "react-native";
import io from "socket.io-client";
import { Card, User } from "../../../model";
import { Header } from "../Header";
import { Hand } from "./Hand";

type Props = {
  goBack: () => void;
  user: User;
};

export class Game extends React.Component<Props> {
  socket!: SocketIOClient.Socket;
  state = { hand: none };

  componentDidMount() {
    this.socket = io("http://192.168.0.65:3555", {
      query: this.props.user,
    });
    this.socket.on("mypong", (start: number) =>
      console.log("passed", Date.now() - start),
    );
    this.socket.on("newData", (hand: Card[]) => {
      this.setState({ hand: some(hand) });
    });
  }

  ping = () => {
    console.log("sending ping");
    this.socket.emit("myping", Date.now());
  };

  render() {
    return (
      <View>
        <Header
          title="Hello"
          leftComponent={{
            icon: "arrow-back",
            color: "#fff",
            onPress: this.props.goBack,
          }}
        />
        <Text>Hello Board</Text>
        {this.state.hand.fold(null, hand => (
          <Hand hand={hand} />
        ))}
      </View>
    );
  }
}
