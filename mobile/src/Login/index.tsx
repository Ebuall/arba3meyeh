import * as React from "react";
import { View, StyleSheet } from "react-native";
import { FormInput, FormLabel, Button, Text } from "react-native-elements";
import { view, text } from "../helpers/styles";

type Props = {
  submit: (username: string) => void;
};

export class Login extends React.Component<Props> {
  state = { username: "User" };
  onSubmit = () => {
    console.log("joining", this.state.username);
    this.props.submit(this.state.username);
  };
  onInput = (username: string) => {
    this.setState({ username });
  };
  render() {
    return (
      <View style={styles.page}>
        <View>
          <Text h1 style={styles.title}>
            Welcome
          </Text>
          <FormLabel>Enter Username</FormLabel>
          <FormInput value={this.state.username} onChangeText={this.onInput} />
          <Button title="Join Game" onPress={this.onSubmit} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: view({
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }),
  title: text({
    textAlign: "center",
  }),
});
