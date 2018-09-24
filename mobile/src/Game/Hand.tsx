import * as React from "react";
import { StyleSheet, View, TouchableHighlight } from "react-native";

import { Card } from "../../../model";
import { CardComponent } from "./Card";

type Props = {
  hand: Card[];
  onPlay: (c: number) => void;
  iconSize: number;
  cardIntersection: number;
};

export class Hand extends React.PureComponent<Props> {
  render() {
    const { hand, iconSize, cardIntersection, onPlay } = this.props;
    return (
      <View style={{ flexDirection: "row", paddingLeft: cardIntersection }}>
        {hand.map((card, i) => (
          // <Draggable key={Card.show(card)}>
          <CardComponent
            onPress={() => onPlay(i)}
            key={Card.show(card)}
            card={card}
            iconSize={iconSize}
            cardIntersection={cardIntersection}
          />
          // </Draggable>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({});
