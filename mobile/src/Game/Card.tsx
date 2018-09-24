import * as React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { Card, Rank } from "../../../model";
import { UpdatedIcon as Icon } from "../updatedMCI";

type Props = {
  card: Card;
  cardIntersection?: number;
  iconSize?: number;
  onPress?: () => void;
  scale?: number;
};
const styles = StyleSheet.create({
  cardBlack: {
    color: "black",
  },
  cardRed: {
    color: "red",
  },
});

const suits = [
  (iconSize: number) => (
    <Icon name="cards-club" style={styles.cardBlack} size={iconSize} />
  ),
  (iconSize: number) => (
    <Icon name="cards-diamond" style={styles.cardRed} size={iconSize} />
  ),
  (iconSize: number) => (
    <Icon name="cards-heart" style={styles.cardRed} size={iconSize} />
  ),
  (iconSize: number) => (
    <Icon name="cards-spade" style={styles.cardBlack} size={iconSize} />
  ),
];

export class CardComponent extends React.PureComponent<Props> {
  render() {
    const {
      card,
      iconSize = 18,
      cardIntersection = 0,
      onPress,
      scale = 1,
    } = this.props;
    const scaledStyles = getStyles(scale);
    return (
      <TouchableHighlight
        style={[scaledStyles.cardContainer, { marginLeft: -cardIntersection }]}
        underlayColor="#eee"
        onPress={onPress}
      >
        <View style={scaledStyles.description}>
          <Text
            style={[
              scaledStyles.rank,
              Card.isBlack(card) ? styles.cardBlack : styles.cardRed,
            ]}
          >
            {Rank.show(card[0])}
          </Text>
          {suits[card[1]](iconSize * scale)}
        </View>
      </TouchableHighlight>
    );
  }
}
const getStyles = (scale: number) =>
  StyleSheet.create({
    cardContainer: {
      height: 100 * scale,
      width: 71 * scale,
      borderWidth: 2 * scale,
      borderStyle: "solid",
      borderColor: "black",
      borderRadius: 5 * scale,
      backgroundColor: "white",
    },

    description: {
      justifyContent: "center",
      alignItems: "center",
      width: 24 * scale,
      height: 42 * scale,
    },
    rank: {
      fontSize: 16 * scale,
    },
  });
