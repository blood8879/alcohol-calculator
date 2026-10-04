import { computeRevealScrollOffset } from "../utils/keyboardReveal";

describe("computeRevealScrollOffset (Android calculator keyboard)", () => {
  it("scrolls so the calculate button sits fully above the keyboard", () => {
    // Given the button at y=300 (52 tall) and a 280px viewport left above the keyboard.
    const offset = computeRevealScrollOffset({
      targetY: 300,
      targetHeight: 52,
      viewportHeight: 280,
      currentOffset: 0,
    });
    // Then its bottom (352) plus the 16px margin lands at the viewport bottom.
    expect(offset).toBe(88);
  });

  it("does nothing when the button is already visible", () => {
    expect(
      computeRevealScrollOffset({ targetY: 100, targetHeight: 52, viewportHeight: 400, currentOffset: 0 })
    ).toBeNull();
  });

  it("never scrolls back up past where the user already is", () => {
    expect(
      computeRevealScrollOffset({ targetY: 300, targetHeight: 52, viewportHeight: 280, currentOffset: 120 })
    ).toBeNull();
  });

  it("ignores unmeasured layouts", () => {
    expect(
      computeRevealScrollOffset({ targetY: 300, targetHeight: 52, viewportHeight: 0, currentOffset: 0 })
    ).toBeNull();
  });
});
