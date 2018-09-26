import { AuthSession } from "expo";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { SocialIcon, Text } from "react-native-elements";
import { User } from "../../../model";
import { text, view } from "../helpers/styles";

type Props = {
  submit: (user: User) => void;
};

const clientId =
  "102101967807-6sp9iovsn4h4im651fnspcr0v05vs4ik.apps.googleusercontent.com";

export class Login extends React.Component<Props> {
  // state = { username: "User" };
  // onSubmit = () => {
  //   console.log("joining", this.state.username);
  //   this.props.submit({
  //     name: this.state.username,
  //     id: this.state.username + Math.random(),
  //   });
  // };
  // onInput = (username: string) => {
  //   this.setState({ username });
  // };
  googleAuth = async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    const result = await AuthSession.startAsync({
      authUrl:
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `&scope=profile` +
        `&client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&response_type=token`,
    });
    console.log("auth", redirectUrl, result);
    if (result.type === "success") {
      const { token_type, access_token } = result.params;
      const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: token_type + " " + access_token,
        },
      });
      if (res.ok) {
        const user = await res.json();
        console.log("profile data", user);
        this.props.submit(user);
      }
    }
  };
  render() {
    return (
      <View style={styles.page}>
        <View>
          <Text h1 style={styles.title}>
            Welcome
          </Text>
          {/* <FormLabel>Enter Username</FormLabel>
          <FormInput value={this.state.username} onChangeText={this.onInput} />
          <Button title="Join Game" onPress={this.onSubmit} /> */}
          <SocialIcon
            button
            type="google-plus-official"
            title="Join with Google"
            onPress={this.googleAuth}
          />
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
    color: "white",
  }),
});
