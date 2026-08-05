import {
  CustomDrink,
  addToCollection,
  removeFromCollection,
  standardDrinksOf,
  updateInCollection,
} from "../utils/customDrinks";

const drink = (id: string, name: string): CustomDrink => ({
  id,
  name,
  abv: 16.5,
  volumeMl: 360,
});

describe("custom drinks", () => {
  it("converts volume and abv to standard drinks (14g ethanol)", () => {
    // 360ml 소주(16.5%): 360 * 0.165 * 0.789 / 14 ≈ 3.3
    expect(standardDrinksOf(360, 16.5)).toBeCloseTo(3.3, 1);
    expect(standardDrinksOf(0, 16.5)).toBe(0);
  });

  it("appends a new drink with a generated id", () => {
    const next = addToCollection([], {
      name: "하우스 와인",
      abv: 13,
      volumeMl: 150,
      price: 8000,
    });
    expect(next).toHaveLength(1);
    expect(next[0].id).toBeTruthy();
    expect(next[0].name).toBe("하우스 와인");
    expect(next[0].price).toBe(8000);
  });

  it("updates only the matching drink", () => {
    const drinks = [drink("a", "소주"), drink("b", "맥주")];
    const next = updateInCollection(drinks, "b", { abv: 5, volumeMl: 500 });
    expect(next.find((d) => d.id === "b")).toMatchObject({
      abv: 5,
      volumeMl: 500,
      name: "맥주",
    });
    // 다른 항목은 그대로.
    expect(next.find((d) => d.id === "a")).toEqual(drinks[0]);
  });

  it("removes a drink by id", () => {
    const drinks = [drink("a", "소주"), drink("b", "맥주")];
    const next = removeFromCollection(drinks, "a");
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe("b");
  });

  it("does not mutate the input collection", () => {
    const drinks = [drink("a", "소주")];
    addToCollection(drinks, { name: "x", abv: 5, volumeMl: 100 });
    updateInCollection(drinks, "a", { abv: 40 });
    removeFromCollection(drinks, "a");
    expect(drinks).toHaveLength(1);
    expect(drinks[0].abv).toBe(16.5);
  });
});
