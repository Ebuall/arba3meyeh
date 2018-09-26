import { FontAwesome } from "@expo/vector-icons";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-elements";
import { UserConnection } from "../../../frontend/user";
import { User } from "../../../model";
import { FullScreenLoader } from "../FullScreenLoader";
import { Controls } from "./Controls";
import { Environment } from "./Environment";

type Props = {
  leaveGame: () => void;
  user: User;
};
// const url = "https://c25e0afd.ngrok.io";
const url = "http://192.168.0.65:3555";

export class Game extends React.Component<Props> {
  render() {
    const { user, leaveGame } = this.props;
    return (
      <View flex={1}>
        <View style={styles.menuButton}>
          <FontAwesome.Button
            color="black"
            backgroundColor="white"
            name="gear"
            onPress={leaveGame}
          >
            Menu
          </FontAwesome.Button>
        </View>
        <UserConnection
          url={url}
          user={user}
          autoPlay={false}
          forceSolo
          delay={0}
          Initial={props => (
            <View>
              <Button onPress={props.onClick} title="Connect" />
            </View>
          )}
          Pending={FullScreenLoader}
          Failure={props => (
            <View>
              <Text>{JSON.stringify(props.err)}</Text>
            </View>
          )}
          Success={props => {
            const { data, info } = props;
            return (
              <View flex={1}>
                <Environment data={data} info={info} />
                <Controls
                  data={data}
                  onPlay={props.playCard}
                  onBid={props.submitBid}
                />
              </View>
            );
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    right: 12,
    top: 12,
  },
});
