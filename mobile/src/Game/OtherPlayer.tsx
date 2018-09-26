import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-elements";
import { Team } from "../../../backend/game";
import { User } from "../../../model";
import { view } from "../helpers/styles";

type Props = {
  team: Team;
  cardCount: number;
  user: User;
};

export class OtherPlayer extends React.PureComponent<Props> {
  render() {
    const { team, cardCount, user } = this.props;
    const color = Team.color(team);
    return (
      <View style={styles.container}>
        <Text style={{ color, textAlign: "center" }}>{user.name}</Text>
        <Text style={{ color, textAlign: "center" }}>{cardCount} cards</Text>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: view({
    // borderColor: "brown",
    // borderWidth: 1,
  }),
});
