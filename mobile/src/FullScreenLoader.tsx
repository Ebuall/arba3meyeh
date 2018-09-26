import * as React from "react";
import { ActivityIndicator, View } from "react-native";

export const FullScreenLoader = () => (
  <View flex={1} justifyContent="center">
    <ActivityIndicator size="large" />
  </View>
);
