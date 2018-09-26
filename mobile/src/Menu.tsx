import * as React from "react";
import { StyleSheet, View } from "react-native";
import { List, ListItem, Text } from "react-native-elements";
import { view, text } from "./helpers/styles";

type Entry = {
  label: string;
  handler: () => void;
};

type Props = {
  entries: Entry[];
};

const MAIN_COLOR = "brown";
const TEXT_COLOR = "white";
const HIGHLIGHT_COLOR = "rosybrown";

export class Menu extends React.PureComponent<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Text h4 style={styles.header}>
          Main Menu
        </Text>
        <List containerStyle={styles.list}>
          {this.props.entries.map(e => (
            <ListItem
              /*       */
              key={e.label}
              title={e.label}
              onPress={e.handler}
              titleStyle={styles.item}
              underlayColor={HIGHLIGHT_COLOR}
            />
          ))}
        </List>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: view({
    backgroundColor: MAIN_COLOR,
    borderRadius: 30,
    padding: 30,
  }),
  header: text({
    textAlign: "center",
    color: TEXT_COLOR,
  }),
  list: view({
    backgroundColor: MAIN_COLOR,
  }),
  item: text({
    color: TEXT_COLOR,
  }),
});
