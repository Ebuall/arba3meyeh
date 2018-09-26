import * as React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { Card } from "../../../model";
import { view } from "../helpers/styles";
import { CardComponent } from "./Card";

type Props = {
  board: (Card | null)[];
};

const Rotate: React.StatelessComponent<{ by: number }> = ({ by, children }) => (
  <View style={{ transform: [{ rotateZ: by + "deg" }] }}>{children}</View>
);

const SCALE = 0.45;
const CardStub = <View style={{ width: 71 * SCALE, height: 100 * SCALE }} />;
function nullableCard(card: Card | null): React.ReactNode {
  return card ? (
    <CardComponent key={Card.show(card)} card={card} scale={SCALE} />
  ) : (
    CardStub
  );
}

export class Board extends React.Component<Props> {
  render() {
    const { board } = this.props;
    const tmCard = <Rotate by={180}>{nullableCard(board[2])}</Rotate>;
    const leftCard = <Rotate by={90}>{nullableCard(board[3])}</Rotate>;
    const rightCard = <Rotate by={-90}>{nullableCard(board[1])}</Rotate>;
    const myCard = <Rotate by={0}>{nullableCard(board[0])}</Rotate>;

    return (
      <ImageBackground
        style={styles.container}
        source={require("../../assets/images/Table_BlueGem.png")}
      >
        {tmCard}
        <View style={styles.middleRow}>
          {leftCard}
          {rightCard}
        </View>
        {myCard}
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: view({
    width: 310,
    height: 230,
    justifyContent: "center",
    alignItems: "center",
    padding: 80,
    margin: -45,
  }),
  middleRow: view({
    flexDirection: "row",
    marginVertical: -20,
    width: "100%",
    justifyContent: "space-between",
  }),
});
