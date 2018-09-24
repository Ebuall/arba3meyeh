import * as React from "react";
import { StyleSheet, View } from "react-native";
import { PlayerState, Team, indexFromOthers } from "../../../backend/game";

import { OtherPlayer } from "./OtherPlayer";
import { view } from "../helpers/styles";
import { Board } from "./Board";
import { rotate } from "fp-ts/lib/Array";
type Props = {
  data: PlayerState;
  // TODO: add names
};

export class Environment extends React.PureComponent<Props> {
  render() {
    const { data } = this.props;
    const teamMateIndex = ((data.index + 2) % 5) - 1;
    const rightIndex = ((data.index + 1) % 5) - 1;
    const leftIndex = ((data.index + 3) % 5) - 1;
    return (
      <View style={styles.container}>
        <View style={styles.firstRow}>
          <OtherPlayer
            cardCount={data.others[teamMateIndex]}
            team={Team.fromIndex(indexFromOthers(teamMateIndex, data.index))}
          />
        </View>
        <View style={styles.secondRow}>
          <View style={styles.leftRotate}>
            <OtherPlayer
              cardCount={data.others[leftIndex]}
              team={Team.fromIndex(indexFromOthers(leftIndex, data.index))}
            />
          </View>
          <Board board={rotate(-data.index, data.board)} />
          <View style={styles.rightRotate}>
            <OtherPlayer
              cardCount={data.others[rightIndex]}
              team={Team.fromIndex(indexFromOthers(rightIndex, data.index))}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: view({
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 130,
  }),
  firstRow: view({
    alignItems: "center",
  }),
  secondRow: view({
    flexDirection: "row",
    justifyContent: "center",
  }),
  leftRotate: view({
    transform: [{ rotateZ: "-90deg" }],
  }),
  rightRotate: view({
    transform: [{ rotateZ: "90deg" }],
  }),
});
