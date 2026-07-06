import { LocalizedText } from "../utils/localizedText";
import { ContentKind } from "../utils/contentStorage";

export type CuratedContentItem = {
  kind: ContentKind;
  id: string;
  emoji: string;
  title: LocalizedText;
  description: LocalizedText;
};

export type SeasonalCollection = {
  id: string;
  emoji: string;
  title: LocalizedText;
  description: LocalizedText;
  items: CuratedContentItem[];
};

export const popularContent: CuratedContentItem[] = [
  {
    kind: "recipe",
    id: "somaek",
    emoji: "🍻",
    title: { ko: "소맥 황금비율", en: "Somaek Ratio", es: "Proporción somaek" },
    description: { ko: "가장 많이 찾는 한국식 맥주+소주 조합", en: "A classic Korean beer and soju mix", es: "Mezcla coreana clásica de cerveza y soju" },
  },
  {
    kind: "recipe",
    id: "earl-grey-highball",
    emoji: "🫖",
    title: { ko: "얼그레이 하이볼", en: "Earl Grey Highball", es: "Highball Earl Grey" },
    description: { ko: "향이 좋아 홈파티에 어울리는 하이볼", en: "An aromatic highball for home gatherings", es: "Un highball aromático para reuniones" },
  },
  {
    kind: "encyclopedia",
    id: "low-calorie-drinks",
    emoji: "🔥",
    title: { ko: "저칼로리 술 고르기", en: "Lower-Calorie Drinks", es: "Bebidas con menos calorías" },
    description: { ko: "칼로리 계산 후 이어 보기 좋은 상식", en: "Useful after checking drink calories", es: "Útil tras revisar calorías" },
  },
  {
    kind: "encyclopedia",
    id: "standard-drink",
    emoji: "📏",
    title: { ko: "표준잔 이해하기", en: "Understand Standard Drinks", es: "Entender tragos estándar" },
    description: { ko: "BAC와 음주 기록을 이해하는 기본 기준", en: "A baseline for BAC and drink tracking", es: "Base para BAC y registro" },
  },
];

export const seasonalCollections: SeasonalCollection[] = [
  {
    id: "summer-highballs",
    emoji: "🧊",
    title: { ko: "여름 하이볼 모음", en: "Summer Highballs", es: "Highballs de verano" },
    description: { ko: "차갑고 가벼운 탄산 조합으로 시작하세요.", en: "Cold, fizzy, easy-drinking combinations.", es: "Combinaciones frías, ligeras y con gas." },
    items: [
      {
        kind: "recipe",
        id: "soju-tonic-lime",
        emoji: "🍋",
        title: { ko: "소주 토닉 라임", en: "Soju Tonic Lime", es: "Soju tonic con lima" },
        description: { ko: "가볍고 상큼한 소주 하이볼", en: "A crisp soju highball", es: "Highball de soju refrescante" },
      },
      {
        kind: "recipe",
        id: "cucumber-gin-fizz",
        emoji: "🥒",
        title: { ko: "오이 진 피즈", en: "Cucumber Gin Fizz", es: "Fizz de gin y pepino" },
        description: { ko: "산뜻한 향의 저녁 한 잔", en: "Fresh and aromatic", es: "Fresco y aromático" },
      },
    ],
  },
  {
    id: "party-mixes",
    emoji: "🎉",
    title: { ko: "홈파티 인기 조합", en: "Home Party Picks", es: "Para fiestas en casa" },
    description: { ko: "여럿이 쉽게 만들고 나눌 수 있는 레시피입니다.", en: "Simple recipes that are easy to share.", es: "Recetas simples para compartir." },
    items: [
      {
        kind: "recipe",
        id: "green-grape-soju",
        emoji: "🍇",
        title: { ko: "청포도 소주 에이드", en: "Green Grape Soju Ade", es: "Ade de soju y uva verde" },
        description: { ko: "달콤하고 접근성 좋은 조합", en: "Sweet and approachable", es: "Dulce y fácil" },
      },
      {
        kind: "recipe",
        id: "red-wine-cola",
        emoji: "🍷",
        title: { ko: "레드와인 콜라", en: "Red Wine Cola", es: "Vino tinto con cola" },
        description: { ko: "남은 와인을 가볍게 즐기는 방법", en: "A casual way to use red wine", es: "Forma casual de usar vino tinto" },
      },
    ],
  },
];

export const getSeasonalCollection = (date = new Date()): SeasonalCollection => {
  const month = date.getMonth();
  return seasonalCollections[month >= 5 && month <= 8 ? 0 : 1];
};
