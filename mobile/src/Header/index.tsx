import * as React from "react";
import { Header as HeaderBase, HeaderProps } from "react-native-elements";

type Props = {
  title: string;
} & HeaderProps;

export class Header extends React.PureComponent<Props> {
  render() {
    const { title, ...props } = this.props;
    return (
      <HeaderBase
        centerComponent={{ text: title, style: { color: "#fff" } }}
        {...props}
      />
    );
  }
}
