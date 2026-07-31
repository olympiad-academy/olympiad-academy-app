declare module "react-native" {
  import type { ReactElement, ReactNode } from "react";

  export type AccessibilityRole =
    | "none"
    | "button"
    | "link"
    | "search"
    | "image"
    | "keyboardkey"
    | "text"
    | "adjustable"
    | "imagebutton"
    | "header"
    | "summary"
    | "alert"
    | "checkbox"
    | "combobox"
    | "menu"
    | "menubar"
    | "menuitem"
    | "progressbar"
    | "radio"
    | "radiogroup"
    | "scrollbar"
    | "spinbutton"
    | "switch"
    | "tab"
    | "tablist"
    | "timer"
    | "toolbar";

  export interface NativeAccessibilityProps {
    readonly accessibilityLabel?: string;
    readonly accessibilityRole?: AccessibilityRole;
    readonly testID?: string;
  }

  export interface NativeTextProps extends NativeAccessibilityProps {
    readonly children?: ReactNode;
  }

  export interface NativeViewProps extends NativeAccessibilityProps {
    readonly children?: ReactNode;
  }

  export interface NativeButtonProps extends NativeAccessibilityProps {
    readonly title: string;
    readonly disabled?: boolean;
    readonly onPress?: () => void;
  }

  export interface NativePressableProps extends NativeAccessibilityProps {
    readonly children?: ReactNode;
    readonly disabled?: boolean;
    readonly onPress?: () => void;
  }

  export interface NativeTextInputProps extends NativeAccessibilityProps {
    readonly multiline?: boolean;
    readonly placeholder?: string;
    readonly selectTextOnFocus?: boolean;
    readonly value?: string;
    readonly onChangeText?: (text: string) => void;
  }

  export interface FlatListRenderItemInfo<ItemT> {
    readonly item: ItemT;
    readonly index: number;
  }

  export interface FlatListProps<ItemT> extends NativeAccessibilityProps {
    readonly data?: readonly ItemT[] | null;
    readonly keyExtractor?: (item: ItemT, index: number) => string;
    readonly ListEmptyComponent?: ReactElement | null | (() => ReactElement | null);
    readonly renderItem: (info: FlatListRenderItemInfo<ItemT>) => ReactElement | null;
  }

  export function Button(props: NativeButtonProps): ReactElement;
  export function FlatList<ItemT>(props: FlatListProps<ItemT>): ReactElement;
  export function Pressable(props: NativePressableProps): ReactElement;
  export function Text(props: NativeTextProps): ReactElement;
  export function TextInput(props: NativeTextInputProps): ReactElement;
  export function View(props: NativeViewProps): ReactElement;
}

declare module "@react-navigation/native" {
  import type { ReactElement, ReactNode } from "react";

  export interface NavigationContainerProps {
    readonly children?: ReactNode;
  }

  export function NavigationContainer(props: NavigationContainerProps): ReactElement;
}

declare module "@react-navigation/native-stack" {
  import type { ComponentType, ReactElement } from "react";

  export interface NativeStackScreenProps {
    readonly name: string;
    readonly component: ComponentType<unknown>;
  }

  export interface NativeStackNavigatorProps {
    readonly children?: ReactElement | readonly ReactElement[];
  }

  export interface NativeStackNavigator {
    readonly Navigator: (props: NativeStackNavigatorProps) => ReactElement;
    readonly Screen: (props: NativeStackScreenProps) => ReactElement;
  }

  export function createNativeStackNavigator(): NativeStackNavigator;
}
