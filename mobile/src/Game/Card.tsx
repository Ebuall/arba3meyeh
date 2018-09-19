import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, Rank } from "../../../model";
import { UpdatedIcon as Icon } from "../updatedMCI";

type Props = {
  card: Card;
};

const IconSize = 18;

export class CardComponent extends React.PureComponent<Props> {
  suits = [
    <Icon name="cards-club" style={styles.cardBlack} size={IconSize} />,
    <Icon name="cards-diamond" style={styles.cardRed} size={IconSize} />,
    <Icon name="cards-heart" style={styles.cardRed} size={IconSize} />,
    <Icon name="cards-spade" style={styles.cardBlack} size={IconSize} />,
  ];
  render() {
    const { card } = this.props;
    return (
      <View style={styles.cardContainer}>
        <View style={styles.description}>
          <Text
            style={[
              styles.rank,
              Card.isBlack(card) ? styles.cardBlack : styles.cardRed,
            ]}
          >
            {Rank.show(card[0])}
          </Text>
          {this.suits[card[1]]}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 100,
    width: 71,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "black",
    borderRadius: 5,
    backgroundColor: "white",
    marginLeft: -30,
  },
  cardBlack: {
    color: "black",
  },
  cardRed: {
    color: "red",
  },
  description: {
    justifyContent: "center",
    alignItems: "center",
    width: 24,
    height: 42,
  },
  rank: {
    fontSize: 16,
  },
});
