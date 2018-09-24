import * as React from "react";
import { Game } from "../Game";
import { Login } from "../Login";
import { none, some, Option } from "fp-ts/lib/Option";
import { User } from "../../../model";

enum Page {
  Login,
  Game,
}
export class Main extends React.Component {
  state = { page: Page.Login, user: none as Option<User> };
  submit = (name: string) => {
    this.setState({ user: some({ name, id: name }), page: Page.Game });
  };
  toLogin = () => {
    this.setState({ page: Page.Login });
  };
  render() {
    if (this.state.page == Page.Game && this.state.user.isSome()) {
      return <Game goBack={this.toLogin} user={this.state.user.value} />;
    } else {
      return <Login submit={this.submit} />;
    }
  }
}
