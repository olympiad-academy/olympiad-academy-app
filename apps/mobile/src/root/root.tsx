import type { ReactElement } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "../navigation/navigation";

export function App(): ReactElement {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
