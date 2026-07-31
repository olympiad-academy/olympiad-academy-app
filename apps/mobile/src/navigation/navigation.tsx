import type { ReactElement } from "react";
import { useState } from "react";
import { Button, View } from "react-native";
import { readMobileApiBaseUrl } from "../config/mobile-api";
import { HomeScreen } from "../screens/home/home";

interface GeneratedMobileRoute {
  readonly key: string;
  readonly title: string;
  render(apiBaseUrl: string): ReactElement;
}

// These bindings are reassigned by managed schematic integration blocks.
// eslint-disable-next-line prefer-const
let generatedMobileAuthRequired = false;
// eslint-disable-next-line prefer-const
let generatedInitialAuthState = true;
// eslint-disable-next-line prefer-const
let renderGeneratedAuthScreen:
  | ((apiBaseUrl: string, onAuthenticated: () => void) => ReactElement)
  | null = null;
const generatedMobileRoutes: GeneratedMobileRoute[] = [];
// vibe-engineer:mobile-root-navigation-integrations:end

export function RootNavigator(): ReactElement {
  const [authenticated, setAuthenticated] = useState(generatedInitialAuthState);
  const [route, setRoute] = useState("home");
  const activeRoute = generatedMobileRoutes.find((item) => item.key === route) ?? null;

  if (generatedMobileAuthRequired && !authenticated && renderGeneratedAuthScreen !== null) {
    return renderGeneratedAuthScreen(readMobileApiBaseUrl(), () => {
      setAuthenticated(true);
    });
  }

  if (activeRoute !== null) {
    return (
      <View accessibilityLabel={`Root route ${route}`}>
        <Button
          title="Home"
          onPress={() => {
            setRoute("home");
          }}
        />
        {activeRoute.render(readMobileApiBaseUrl())}
      </View>
    );
  }

  return (
    <View accessibilityLabel={`Root route ${route}`}>
      <HomeScreen />
      <View accessibilityLabel="Generated feature navigation">
        <Button
          title="Home"
          onPress={() => {
            setRoute("home");
          }}
        />
        {generatedMobileRoutes.map((item) => (
          <Button
            key={item.key}
            title={item.title}
            onPress={() => {
              setRoute(item.key);
            }}
          />
        ))}
      </View>
    </View>
  );
}
