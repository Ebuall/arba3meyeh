import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-elements";
import { Team } from "../../../backend/game";
import { view } from "../helpers/styles";

type Props = {
  team: Team;
  cardCount: number;
};

export class OtherPlayer extends React.PureComponent<Props> {
  render() {
    const { team, cardCount } = this.props;
    return (
      <View style={styles.container}>
        <Text style={{ color: Team.color(team) }}>{cardCount} cards</Text>
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
