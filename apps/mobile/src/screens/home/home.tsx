import type { ReactElement } from "react";
import { Text, View } from "react-native";
import { SystemStatusScreen } from "../system-status/system-status";

export function HomeScreen(): ReactElement {
  return (
    <View>
      <Text>olympiad-academy-app — Mobile</Text>
      <SystemStatusScreen />
    </View>
  );
}
