import { createIconSet } from "@expo/vector-icons";
import { Font } from "expo";
import * as React from "react";
import glyphMap from "../assets/fonts/MaterialCommunityIcons.json";
import { IconProps } from "react-native-vector-icons/Icon";

const CustomIcon = createIconSet(glyphMap, "UpdatedMCI");

Font.loadAsync({
  UpdatedMCI: require("../assets/fonts/MaterialCommunityIcons.ttf"),
});

// export class UpdatedIcon extends React.Component<IconProps> {
//   state = {
//     fontLoaded: false,
//   };
//   async componentDidMount() {
//     await

//     this.setState({ fontLoaded: true });
//   }
//   render() {
//     if (!this.state.fontLoaded) {
//       return null;
//     }

//     return <CustomIcon {...this.props} />;
//   }
// }

export const UpdatedIcon = CustomIcon;
