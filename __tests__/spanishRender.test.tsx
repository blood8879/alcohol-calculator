/**
 * 19회차 — es 사용자에게 영어가 섞여 보이던 화면을 실제 번역 리소스로 렌더해 확인한다.
 * (전역 setup의 react-i18next 목은 키를 그대로 돌려주므로 여기서는 실제 i18next를 쓴다)
 */
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import CalculationCard from "../components/CalculationCard";
import GuideDetailPanel from "../components/GuideDetailPanel";
import RecipeDetail from "../components/RecipeDetail";
import { guideDetails } from "../data/guideDetails";
import { cocktailRecipes } from "../data/cocktailRecipes";
import { quizCategories } from "../data/quizCategories";
import es from "../locales/es.json";

jest.unmock("react-i18next");
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));
jest.mock("../utils/firebase", () => ({ logFirebaseEvent: jest.fn() }));
jest.mock("../utils/historyStorage", () => ({ saveCalculation: jest.fn() }));
jest.mock("../components/InlineBannerAd", () => () => null);
jest.mock("../utils/contentStorage", () => ({
  isFavorite: jest.fn(async () => false),
  toggleFavorite: jest.fn(async () => true),
  addRecentContent: jest.fn(async () => undefined),
}));

// 첫 렌더가 모듈 로딩(콜드 스타트)을 떠안아 부하 시 기본 5초를 넘길 수 있다.
jest.setTimeout(20000);

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: "es",
    fallbackLng: false,
    resources: { es: { translation: es } },
    interpolation: { escapeValue: false },
  });
});

const withEs = (node: React.ReactElement) => <I18nextProvider i18n={i18n}>{node}</I18nextProvider>;

it("calculator sheet guide and recommendation are Spanish", () => {
  render(
    withEs(
      <CalculationCard
        title="BAC"
        description=""
        fields={[{ label: "ml", unit: "ml", placeholder: "0" }]}
        onBack={jest.fn()}
        calculatorType="bac"
        calculatorIcon="📊"
        onRecommendationPress={jest.fn()}
        calculateResult={() => [{ label: "BAC", value: "0.05%" }]}
      />
    )
  );
  expect(screen.getByLabelText("¿Qué hace esta calculadora?")).toBeTruthy();
  fireEvent.press(screen.getByLabelText(es.common.calculate));
  expect(screen.getByText("Revisa tu consumo de la semana")).toBeTruthy();
  expect(screen.getByText("Ver registro ›")).toBeTruthy();
});

it("guide panel shows the translated quiz category instead of its key", () => {
  const guide = guideDetails[0];
  const category = quizCategories.find((c) => c.key === guide.relatedQuizCategory);
  render(withEs(<GuideDetailPanel guide={guide} onPressTarget={jest.fn()} />));
  expect(screen.getByText("Relacionado")).toBeTruthy();
  expect(
    screen.getByText(`${guide.relatedRecipeIds.length} recetas - cuestionario de ${category?.title.es}`)
  ).toBeTruthy();
});

it("recipe detail section titles are Spanish", async () => {
  const recipe = cocktailRecipes.find((r) => r.id === "margarita");
  if (!recipe) throw new Error("margarita recipe missing");
  render(withEs(<RecipeDetail recipe={recipe} onClose={jest.fn()} onOpenGuide={jest.fn()} />));
  await act(async () => undefined);
  expect(screen.getByText("Origen e historia")).toBeTruthy();
  expect(screen.getByText("Consejos")).toBeTruthy();
  expect(screen.getByText("🍃 Decoración")).toBeTruthy();
  expect(screen.getByLabelText("Ver guía de bebida estándar")).toBeTruthy();
});
