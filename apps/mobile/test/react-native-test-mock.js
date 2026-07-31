import { createElement } from "react";

const emptyProps = Object.freeze({});

function toChildrenArray(children) {
  if (children === undefined || children === null) return [];
  return Array.isArray(children)
    ? children.filter((child) => child !== undefined && child !== null)
    : [children];
}

function propsWithoutChildren(props) {
  const elementProps = { ...props };
  delete elementProps.children;
  return elementProps;
}

function nativeElement(type, props = emptyProps, children = props.children) {
  const safeProps = props ?? emptyProps;
  return createElement(type, propsWithoutChildren(safeProps), ...toChildrenArray(children));
}

function renderListEmptyComponent(ListEmptyComponent) {
  if (ListEmptyComponent === undefined || ListEmptyComponent === null) return [];
  if (typeof ListEmptyComponent === "function") return toChildrenArray(ListEmptyComponent());
  return toChildrenArray(ListEmptyComponent);
}

function renderFlatListChildren(props) {
  const safeProps = props ?? emptyProps;
  const data = Array.isArray(safeProps.data) ? safeProps.data : [];
  if (data.length === 0) return renderListEmptyComponent(safeProps.ListEmptyComponent);
  if (typeof safeProps.renderItem !== "function") {
    throw new TypeError("FlatList test mock requires a renderItem function.");
  }
  return data.flatMap((item, index) => toChildrenArray(safeProps.renderItem({ item, index })));
}

export function Button(props = emptyProps) {
  const titleChildren = props.title === undefined ? [] : [props.title];
  return nativeElement("Button", props, titleChildren);
}

export function FlatList(props = emptyProps) {
  return nativeElement("FlatList", props, renderFlatListChildren(props));
}

export function Pressable(props = emptyProps) {
  return nativeElement("Pressable", props);
}

export function TextInput(props = emptyProps) {
  return nativeElement("TextInput", props, []);
}

export function View(props = emptyProps) {
  return nativeElement("View", props);
}

export function Text(props = emptyProps) {
  return nativeElement("Text", props);
}

export const StyleSheet = Object.freeze({
  create(styles) {
    return styles;
  },
});
