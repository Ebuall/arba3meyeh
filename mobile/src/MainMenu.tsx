import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Menu } from "./Menu";
import { view } from "./helpers/styles";

type Props = {
  logout: () => void;
  startGame: () => void;
};

export class MainMenu extends React.PureComponent<Props> {
  render() {
    const entries = [
      { label: "Start game", handler: this.props.startGame },
      { label: "Logout", handler: this.props.logout },
    ];

    return (
      <View style={styles.container}>
        <Menu entries={entries} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: view({
    width: "40%",
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    alignSelf: "center",
  }),
});
