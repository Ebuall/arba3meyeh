import { rotate } from "fp-ts/lib/Array";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  GameInfo,
  indexFromOthers,
  PlayerState,
  Team,
} from "../../../backend/game";
import { view } from "../helpers/styles";
import { Board } from "./Board";
import { OtherPlayer } from "./OtherPlayer";

type Props = {
  data: PlayerState;
  info: GameInfo;
  // TODO: add names
};

export class Environment extends React.PureComponent<Props> {
  render() {
    const { data, info } = this.props;
    const teamMateIndex = ((data.index + 2) % 5) - 1;
    const teamMateIndex4 = indexFromOthers(teamMateIndex, data.index);
    const rightIndex = ((data.index + 1) % 5) - 1;
    const rightIndex4 = indexFromOthers(rightIndex, data.index);
    const leftIndex = ((data.index + 3) % 5) - 1;
    const leftIndex4 = indexFromOthers(leftIndex, data.index);
    return (
      <View style={styles.container}>
        <View style={styles.firstRow}>
          <OtherPlayer
            cardCount={data.others[teamMateIndex]}
            team={Team.fromIndex(teamMateIndex4)}
            user={info.players[teamMateIndex4]}
          />
        </View>
        <View style={styles.secondRow}>
          <View style={styles.leftRotate}>
            <OtherPlayer
              cardCount={data.others[leftIndex]}
              team={Team.fromIndex(leftIndex4)}
              user={info.players[leftIndex4]}
            />
          </View>
          <Board board={rotate(-data.index, data.board)} />
          <View style={styles.rightRotate}>
            <OtherPlayer
              cardCount={data.others[rightIndex]}
              team={Team.fromIndex(rightIndex4)}
              user={info.players[rightIndex4]}
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
    paddingBottom: 120,
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
