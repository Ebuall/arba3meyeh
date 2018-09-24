import * as React from "react";
import {
  ActivityIndicator,
  Text,
  View,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Button } from "react-native-elements";
import { UserConnection } from "../../../frontend/user";
import { User } from "../../../model";
import { Controls } from "./Controls";
import { FontAwesome } from "@expo/vector-icons";
import { Team, PlayerState } from "../../../backend/game";
import { Environment } from "./Environment";

type Props = {
  goBack: () => void;
  user: User;
};
const url = "https://c25e0afd.ngrok.io";
// url="http://192.168.0.65:3555"
console.log("url:", url);
export class Game extends React.Component<Props> {
  render() {
    const { user, goBack } = this.props;
    return (
      <View flex={1} paddingTop={StatusBar.currentHeight}>
        <View style={styles.menuButton}>
          {/* <Button title="Menu" onPress={goBack} /> */}
          <FontAwesome.Button
            color="black"
            backgroundColor="white"
            name="gear"
            onPress={goBack}
            // style={styles.menuIcon}
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
          Pending={() => (
            <View flex={1} justifyContent="center">
              <ActivityIndicator size="large" />
            </View>
          )}
          Failure={props => (
            <View>
              <Text>{JSON.stringify(props.err)}</Text>
            </View>
          )}
          Success={props => {
            const data: PlayerState = props.data;
            return (
              <View flex={1}>
                <Environment data={data} />
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
    top: StatusBar.currentHeight,
  },
});
