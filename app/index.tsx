import { View } from "react-native";
import Homepage from "./containers/homepage";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Homepage />
    </View>
  );
}
