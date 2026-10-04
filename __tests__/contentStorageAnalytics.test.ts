import AsyncStorage from "@react-native-async-storage/async-storage";
import { toggleFavorite } from "../utils/contentStorage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));

test("failed favorite persistence cannot be reported as success", async () => {
  jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error("storage unavailable"));
  const warning = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  const result = await toggleFavorite({ kind: "recipe", id: "somaek", label: "Somaek", emoji: "🍺", viewedAt: 0 });
  expect(result).toBeNull();
  warning.mockRestore();
});
