import { extendedGuideDetails } from "./guideDetailsExtended";
import type { LocalizedText } from "../utils/localizedText";

export type GuideDetail = {
  readonly entryId: string;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  readonly quickFacts: readonly LocalizedText[];
  readonly relatedRecipeIds: readonly string[];
  readonly relatedQuizCategory: "basics" | "cocktails" | "korean" | "safety";
  readonly nextStep: {
    readonly label: LocalizedText;
    readonly target: "/(tabs)/tracker" | "/(tabs)/explore?section=recipes" | "/(tabs)/quiz";
  };
};

export const guideDetails: readonly GuideDetail[] = [
  {
    entryId: "standard-drink",
    title: {
      ko: "표준잔은 서로 다른 술을 비교하는 공통 기준입니다",
      en: "A standard drink is a common comparison unit",
      es: "Un trago estándar es una unidad común de comparación",
    },
    summary: {
      ko: "맥주, 와인, 증류주는 도수와 용량이 달라 단순 잔 수만으로 비교하기 어렵습니다. 표준잔은 총 알코올량을 같은 기준으로 읽게 해줍니다.",
      en: "Beer, wine, and spirits differ by ABV and volume, so glass count alone is misleading. Standard drinks compare total alcohol on one scale.",
      es: "Cerveza, vino y destilados varían por ABV y volumen; contar vasos puede engañar. El trago estándar compara alcohol total.",
    },
    quickFacts: [
      {
        ko: "기록할 때는 ml, 도수, 잔 수를 함께 남기는 것이 가장 유용합니다.",
        en: "Logging volume, ABV, and count together gives the most useful pattern.",
        es: "Registrar volumen, ABV y cantidad da el patrón más útil.",
      },
      {
        ko: "표준잔은 건강·법률 판단이 아니라 개인 기록을 돕는 참고 기준입니다.",
        en: "Standard drink estimates support personal tracking, not medical or legal decisions.",
        es: "El trago estándar ayuda al registro personal, no a decisiones médicas o legales.",
      },
    ],
    relatedRecipeIds: ["somaek", "soju-tonic-lime", "whiskey-cola-highball"],
    relatedQuizCategory: "safety",
    nextStep: {
      label: {
        ko: "오늘 기록으로 비교하기",
        en: "Compare with today's log",
        es: "Comparar con el registro de hoy",
      },
      target: "/(tabs)/tracker",
    },
  },
  {
    entryId: "soju",
    title: {
      ko: "소주는 도수보다 1회 제공량이 핵심입니다",
      en: "With soju, serving size matters as much as ABV",
      es: "Con soju, la porción importa tanto como el ABV",
    },
    summary: {
      ko: "한 병을 여러 잔으로 나눠 마셔도 전체 알코올량은 그대로입니다. 기록할 때는 잔 수보다 ml와 도수를 함께 확인하세요.",
      en: "A bottle split into small glasses still has the same total alcohol. Log both volume and ABV instead of relying only on glass count.",
      es: "Una botella servida en vasos pequeños conserva el mismo alcohol total. Registra volumen y ABV, no solo vasos.",
    },
    quickFacts: [
      {
        ko: "희석식 소주는 보통 16~17도, 전통 소주는 더 높은 경우가 많습니다.",
        en: "Modern diluted soju is often 16-17% ABV, while traditional soju can be higher.",
        es: "El soju diluido moderno suele tener 16-17% ABV; el tradicional puede ser más alto.",
      },
      {
        ko: "소맥처럼 맥주와 섞으면 총량과 칼로리가 같이 늘어납니다.",
        en: "Mixed drinks such as somaek increase both total volume and calories.",
        es: "Mezclas como somaek aumentan volumen total y calorías.",
      },
    ],
    relatedRecipeIds: ["somaek", "soju-tonic-lime", "green-grape-soju"],
    relatedQuizCategory: "korean",
    nextStep: {
      label: {
        ko: "오늘 마신 소주 기록하기",
        en: "Log today's soju",
        es: "Registrar el soju de hoy",
      },
      target: "/(tabs)/tracker",
    },
  },
  {
    entryId: "beer",
    title: {
      ko: "맥주는 낮은 도수라도 양이 쉽게 늘어납니다",
      en: "Beer is lower ABV, but volume adds up",
      es: "La cerveza tiene menor ABV, pero el volumen suma",
    },
    summary: {
      ko: "캔, 생맥주, 피처처럼 용량 차이가 커서 칼로리와 알코올량이 예상보다 커질 수 있습니다.",
      en: "Cans, draft pours, and pitchers vary widely, so calories and alcohol can climb faster than expected.",
      es: "Latas, tiradas y jarras varían mucho; calorías y alcohol pueden subir rápido.",
    },
    quickFacts: [
      {
        ko: "500ml 맥주는 355ml 캔보다 같은 도수에서도 알코올량이 더 큽니다.",
        en: "A 500 ml beer has more alcohol than a 355 ml can at the same ABV.",
        es: "Una cerveza de 500 ml tiene más alcohol que una lata de 355 ml al mismo ABV.",
      },
      {
        ko: "가벼운 맥주를 찾을 때는 도수와 100ml당 칼로리를 같이 보세요.",
        en: "For lighter choices, compare both ABV and calories per 100 ml.",
        es: "Para opciones más ligeras, compara ABV y calorías por 100 ml.",
      },
    ],
    relatedRecipeIds: ["somaek", "poktanju", "whiskey-cola-highball"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "가벼운 레시피 추천 보기",
        en: "Find lighter recipes",
        es: "Ver recetas más ligeras",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "red-wine",
    title: {
      ko: "와인은 잔 크기와 칼로리 차이를 같이 봐야 합니다",
      en: "Wine needs both pour size and calorie context",
      es: "El vino requiere revisar porción y calorías",
    },
    summary: {
      ko: "와인은 도수가 비슷해 보여도 잔 용량과 당도에 따라 섭취량이 달라집니다.",
      en: "Wine may look similar by ABV, but pour size and sweetness change the total intake.",
      es: "El ABV puede parecer similar, pero porción y dulzor cambian la ingesta total.",
    },
    quickFacts: [
      {
        ko: "레드와인은 보통 12~15도이며 150ml 잔 기준으로 계산하는 것이 현실적입니다.",
        en: "Red wine is often 12-15% ABV, and a 150 ml glass is a practical estimate.",
        es: "El vino tinto suele tener 12-15% ABV; 150 ml es una referencia práctica.",
      },
      {
        ko: "콜라나 주스와 섞는 레시피는 당과 칼로리가 같이 늘 수 있습니다.",
        en: "Mixes with cola or juice can raise sugar and calories.",
        es: "Mezclas con cola o jugo pueden aumentar azúcar y calorías.",
      },
    ],
    relatedRecipeIds: ["red-wine-cola"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "와인 칼로리 기록하기",
        en: "Log wine calories",
        es: "Registrar calorías del vino",
      },
      target: "/(tabs)/tracker",
    },
  },
  {
    entryId: "whiskey",
    title: {
      ko: "위스키는 소량이어도 표준잔이 빠르게 쌓입니다",
      en: "Whiskey adds standard drinks quickly",
      es: "El whisky suma tragos estándar rápido",
    },
    summary: {
      ko: "40도 전후의 증류주는 적은 ml에도 알코올량이 높습니다. 하이볼은 희석되지만 원액량 기준을 확인하세요.",
      en: "Spirits near 40% ABV carry more alcohol in fewer milliliters. Highballs dilute the drink, but base spirit volume still matters.",
      es: "Destilados cerca de 40% ABV tienen más alcohol en menos ml. En highballs, revisa el volumen base.",
    },
    quickFacts: [
      {
        ko: "30ml 샷 하나도 저도수 음료보다 알코올량이 클 수 있습니다.",
        en: "A 30 ml shot can exceed lower-ABV drinks in alcohol content.",
        es: "Un shot de 30 ml puede superar bebidas de menor ABV.",
      },
      {
        ko: "탄산수 하이볼은 칼로리를 낮추는 데 도움이 됩니다.",
        en: "Soda highballs can help keep calories lower.",
        es: "Highballs con soda pueden reducir calorías.",
      },
    ],
    relatedRecipeIds: ["whiskey-cola-highball", "earl-grey-highball"],
    relatedQuizCategory: "cocktails",
    nextStep: {
      label: {
        ko: "위스키 레시피 비교하기",
        en: "Compare whiskey recipes",
        es: "Comparar recetas con whisky",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "makgeolli",
    title: {
      ko: "막걸리는 낮은 도수와 높은 용량을 같이 봐야 합니다",
      en: "Makgeolli pairs lower ABV with larger pours",
      es: "Makgeolli combina menor ABV con porciones grandes",
    },
    summary: {
      ko: "도수는 낮아도 한 사발 또는 병 단위로 마시면 총량과 칼로리가 커질 수 있습니다.",
      en: "Even at lower ABV, bowl or bottle servings can raise total volume and calories.",
      es: "Aunque tenga menor ABV, tazones o botellas elevan volumen y calorías.",
    },
    quickFacts: [
      {
        ko: "막걸리는 침전물이 있어 흔들기 전후 맛과 농도가 달라집니다.",
        en: "Makgeolli has sediment, so shaking changes texture and flavor.",
        es: "Makgeolli tiene sedimento; agitar cambia textura y sabor.",
      },
      {
        ko: "스프리츠처럼 탄산수와 섞으면 도수 체감이 낮아질 수 있습니다.",
        en: "Spritz-style mixes can feel lighter because of dilution.",
        es: "Mezclas tipo spritz pueden sentirse más ligeras por dilución.",
      },
    ],
    relatedRecipeIds: ["makgeolli-spritz", "coffee-makgeolli"],
    relatedQuizCategory: "korean",
    nextStep: {
      label: {
        ko: "막걸리 조합 보기",
        en: "Open makgeolli ideas",
        es: "Ver ideas con makgeolli",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
];

export const allGuideDetails: readonly GuideDetail[] = [
  ...guideDetails,
  ...extendedGuideDetails,
];

export const getGuideDetail = (entryId: string): GuideDetail | undefined =>
  allGuideDetails.find((guide) => guide.entryId === entryId);
