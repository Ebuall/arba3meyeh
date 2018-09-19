import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "../../../model";
import { CardComponent } from "./Card";

type Props = {
  hand: Card[];
};

export class Hand extends React.PureComponent<Props> {
  render() {
    const { hand } = this.props;
    return (
      <View style={styles.hand}>
        {hand.map(card => (
          <CardComponent key={Card.show(card)} card={card} />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  hand: {
    flexDirection: "row",
  },
});
