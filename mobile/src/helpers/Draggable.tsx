import * as React from "react";
import { View, Animated } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";

type Props = {};
export class Draggable extends React.Component<Props> {
  _touchY = new Animated.Value(0);
  _onPanEvent = Animated.event([{ nativeEvent: { y: this._touchY } }], {
    useNativeDriver: true,
  });
  render() {
    return (
      <PanGestureHandler onGestureEvent={this._onPanEvent}>
        <Animated.View style={[{ transform: [{ translateY: this._touchY }] }]}>
          {this.props.children}
        </Animated.View>
      </PanGestureHandler>
    );
  }
}
