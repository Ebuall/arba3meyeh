import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, ButtonGroup } from "react-native-elements";
import { PlayerState, GameState } from "../../../backend/game";
import { view } from "../helpers/styles";
import { Hand } from "./Hand";

type Props = {
  data: PlayerState;
  onPlay: (c: number) => void;
  onBid: (b: number) => void;
};
const bids = Array.from(Array(12), (_, i) => String(i + 2));
export class Controls extends React.PureComponent<Props> {
  render() {
    const { data, onPlay, onBid } = this.props;
    return (
      <View style={styles.container}>
        {data.state === GameState.Bids &&
          data.index === data.playerTurn && (
            <View>
              <Text style={styles.bidTitle}>Select your bid</Text>
              <ButtonGroup
                buttons={bids}
                selectedIndex={-1}
                onPress={i => onBid(i + 2)}
              />
            </View>
          )}
        <View style={styles.handWrapper}>
          <ScrollView horizontal style={styles.handScroll}>
            <Hand
              hand={data.hand}
              iconSize={18}
              cardIntersection={15}
              onPlay={onPlay}
            />
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: view({
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
  }),
  handWrapper: view({
    padding: 5,
    backgroundColor: "brown",
    height: 110,
  }),
  handScroll: view({}),
  bidTitle: { color: "white", textAlign: "center" },
});
