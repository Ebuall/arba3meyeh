import {
  initial,
  pending,
  RemoteData,
  success,
} from "@devexperts/remote-data-ts";
import * as React from "react";
import {
  AsyncStorage,
  ImageBackground,
  StatusBar,
  Text,
  View,
} from "react-native";
import { User } from "../../../model";
import { FullScreenLoader } from "../FullScreenLoader";
import { Game } from "../Game";
import { Login } from "../Login";
import { MainMenu } from "../MainMenu";

enum Page {
  Menu,
  Game,
}
type State = {
  page: Page;
  user: RemoteData<string, User>;
};
export class Main extends React.Component<{}, State> {
  state: State = { page: Page.Menu, user: pending };
  async componentDidMount() {
    const mUser = await AsyncStorage.getItem("user");
    if (mUser) {
      this.setState({ user: success(JSON.parse(mUser)) });
    } else {
      this.setState({ user: initial });
    }
  }
  submit = (user: User) => {
    this.setState({ user: success(user), page: Page.Menu });
    AsyncStorage.setItem("user", JSON.stringify(user));
  };
  logout = () => {
    this.setState({ user: initial });
    AsyncStorage.removeItem("user");
  };
  startGame = () => {
    if (this.state.user.isSuccess()) {
      this.setState({ page: Page.Game });
    }
  };
  leaveGame = () => {
    this.setState({ page: Page.Menu });
  };
  render() {
    const { page, user } = this.state;
    return (
      <ImageBackground
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
        source={require("../../assets/images/Carpet_Greenfield.png")}
      >
        <StatusBar hidden />
        {user.fold(
          <Login submit={this.submit} />,
          <FullScreenLoader />,
          e => (
            <View>
              <Text>{JSON.stringify(e)}</Text>
            </View>
          ),
          user => {
            switch (page) {
              case Page.Menu:
                return (
                  <MainMenu logout={this.logout} startGame={this.startGame} />
                );
              case Page.Game:
                return <Game user={user} leaveGame={this.leaveGame} />;
            }
          },
        )}
      </ImageBackground>
    );
  }
}
