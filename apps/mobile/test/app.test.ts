import assert from "node:assert/strict";
import test from "node:test";
import { Button, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { normalizeMobileApiBaseUrl, readMobileApiBaseUrl } from "../src/config/mobile-api.js";
import { HomeScreen } from "../src/screens/home/home.js";

test("mobile starter screen imports React Native and workspace packages in Node tests", () => {
  const screen = HomeScreen();
  assert.equal(typeof screen, "object");
});

test("mobile API base URL config is explicit absolute and fail-closed", () => {
  assert.equal(
    normalizeMobileApiBaseUrl(" http://127.0.0.1:3000/api/ "),
    "http://127.0.0.1:3000/api",
  );
  assert.equal(
    readMobileApiBaseUrl({ EXPO_PUBLIC_API_BASE_URL: "https://api.example.invalid/api" }),
    "https://api.example.invalid/api",
  );
  assert.throws(() => normalizeMobileApiBaseUrl(undefined), /EXPO_PUBLIC_API_BASE_URL/u);
  assert.throws(() => normalizeMobileApiBaseUrl("/api"), /absolute HTTP\(S\) URL/u);
  assert.throws(
    () => normalizeMobileApiBaseUrl("http://127.0.0.1:3000"),
    /generated \/api route prefix/u,
  );
});

test("mobile React Native test mock renders deterministic CRUD-flow primitives", () => {
  const button = Button({ title: "Create record", onPress: () => undefined });
  assert.equal(button.type, "Button");
  assert.equal(button.props.title, "Create record");
  assert.equal(button.props.children, "Create record");

  const input = TextInput({
    accessibilityLabel: "Search records",
    placeholder: "Search",
    value: "draft",
    onChangeText: () => undefined,
  });
  assert.equal(input.type, "TextInput");
  assert.equal(input.props.value, "draft");

  const pressable = Pressable({
    accessibilityRole: "button",
    children: Text({ children: "Open detail" }),
    onPress: () => undefined,
  });
  assert.equal(pressable.type, "Pressable");
  assert.equal(pressable.props.children.type, "Text");

  const renderedRows: string[] = [];
  const list = FlatList({
    data: [
      { id: "one", title: "One" },
      { id: "two", title: "Two" },
    ],
    keyExtractor: (item) => item.id,
    renderItem: ({ item, index }) => {
      renderedRows.push(`${index}:${item.id}`);
      return View({ children: Text({ children: item.title }) });
    },
  });
  assert.equal(list.type, "FlatList");
  assert.deepEqual(renderedRows, ["0:one", "1:two"]);
  assert.equal(Array.isArray(list.props.children), true);
  assert.equal(list.props.children.length, 2);

  let emptyRenderCalls = 0;
  const emptyList = FlatList<{ id: string }>({
    data: [],
    ListEmptyComponent: () => Text({ children: "No records found" }),
    renderItem: () => {
      emptyRenderCalls += 1;
      return null;
    },
  });
  assert.equal(emptyRenderCalls, 0);
  assert.equal(emptyList.props.children.type, "Text");
  assert.equal(emptyList.props.children.props.children, "No records found");
});
