import { LocalizedText } from "../utils/localizedText";

export type FoodPairing = {
  id: string;
  emoji: string;
  drink: LocalizedText;
  pairings: readonly LocalizedText[];
  note: LocalizedText;
};

export const foodPairings: readonly FoodPairing[] = [
  {
    id: "soju",
    emoji: "🍶",
    drink: { ko: "소주", en: "Soju", es: "Soju" },
    pairings: [
      { ko: "삼겹살", en: "Grilled pork belly", es: "Panceta de cerdo a la parrilla" },
      { ko: "회(생선 회)", en: "Raw fish (sashimi-style)", es: "Pescado crudo (estilo sashimi)" },
      { ko: "육회", en: "Korean beef tartare", es: "Tartar de ternera coreano" },
      { ko: "해물탕·감자탕", en: "Seafood or pork bone stew", es: "Estofado de mariscos o hueso de cerdo" },
    ],
    note: {
      ko: "기름진 음식과 함께하면 소주의 청량감이 입안을 깔끔하게 정리해 준다.",
      en: "The clean finish of soju cuts through fatty foods, refreshing the palate between bites.",
      es: "El final limpio del soju corta los alimentos grasos, refrescando el paladar entre bocados.",
    },
  },
  {
    id: "beer",
    emoji: "🍺",
    drink: { ko: "맥주", en: "Beer", es: "Cerveza" },
    pairings: [
      { ko: "치킨·프라이드 치킨", en: "Fried chicken", es: "Pollo frito" },
      { ko: "피자", en: "Pizza", es: "Pizza" },
      { ko: "소시지·브라트부어스트", en: "Sausages / Bratwurst", es: "Salchichas / Bratwurst" },
      { ko: "나초·감자칩", en: "Nachos / potato chips", es: "Nachos / papas fritas" },
    ],
    note: {
      ko: "탄산과 쓴맛이 기름진 튀김 요리의 느끼함을 잡아주어 황금 조합으로 불린다.",
      en: "The carbonation and bitterness of beer counterbalance the richness of fried foods — a classic pairing.",
      es: "La carbonatación y el amargor de la cerveza contrarrestan la riqueza de los fritos: una combinación clásica.",
    },
  },
  {
    id: "makgeolli",
    emoji: "🥛",
    drink: { ko: "막걸리", en: "Makgeolli (Rice Wine)", es: "Makgeolli (vino de arroz)" },
    pairings: [
      { ko: "파전(파 부침개)", en: "Green onion pancake (pajeon)", es: "Torta de cebolleta (pajeon)" },
      { ko: "두부김치", en: "Tofu with stir-fried kimchi", es: "Tofu con kimchi salteado" },
      { ko: "동동주·보쌈", en: "Boiled pork wraps (bossam)", es: "Envueltos de cerdo hervido (bossam)" },
    ],
    note: {
      ko: "비 오는 날 파전과 막걸리 조합은 한국의 전통적인 풍경이다.",
      en: "On rainy days, pajeon and makgeolli is a beloved Korean tradition.",
      es: "En días lluviosos, el pajeon y el makgeolli es una querida tradición coreana.",
    },
  },
  {
    id: "red_wine",
    emoji: "🍷",
    drink: { ko: "레드 와인", en: "Red Wine", es: "Vino tinto" },
    pairings: [
      { ko: "스테이크·구운 소고기", en: "Steak / grilled beef", es: "Filete / ternera a la parrilla" },
      { ko: "숙성 치즈(체다·파르미지아노)", en: "Aged cheese (cheddar, parmesan)", es: "Queso curado (cheddar, parmesano)" },
      { ko: "라구·볼로네제 파스타", en: "Bolognese / ragu pasta", es: "Pasta a la boloñesa / ragú" },
      { ko: "다크 초콜릿", en: "Dark chocolate", es: "Chocolate negro" },
    ],
    note: {
      ko: "타닌이 풍부한 레드 와인은 붉은 육류의 단백질과 결합해 감칠맛을 극대화한다.",
      en: "Tannins in red wine bind to the proteins in red meat, intensifying the umami and making each sip smoother.",
      es: "Los taninos del vino tinto se unen a las proteínas de la carne roja, intensificando el umami y suavizando cada sorbo.",
    },
  },
  {
    id: "white_wine",
    emoji: "🥂",
    drink: { ko: "화이트 와인", en: "White Wine", es: "Vino blanco" },
    pairings: [
      { ko: "생굴·조개류", en: "Oysters / shellfish", es: "Ostras / mariscos" },
      { ko: "크림 파스타·리조토", en: "Cream pasta / risotto", es: "Pasta a la crema / risotto" },
      { ko: "흰살생선 구이", en: "Grilled white fish", es: "Pescado blanco a la parrilla" },
      { ko: "신선한 염소 치즈", en: "Fresh goat cheese", es: "Queso de cabra fresco" },
    ],
    note: {
      ko: "산도가 높은 화이트 와인은 해산물의 비린내를 잡아주고 풍미를 살려준다.",
      en: "The high acidity of white wine neutralises fishiness and lifts the delicate flavours of seafood.",
      es: "La alta acidez del vino blanco neutraliza el olor a pescado y realza los delicados sabores de los mariscos.",
    },
  },
  {
    id: "whisky",
    emoji: "🥃",
    drink: { ko: "위스키", en: "Whisky", es: "Whisky" },
    pairings: [
      { ko: "훈제 연어", en: "Smoked salmon", es: "Salmón ahumado" },
      { ko: "숙성 치즈(블루 치즈·그뤼에르)", en: "Aged cheese (blue cheese, gruyère)", es: "Queso curado (queso azul, gruyère)" },
      { ko: "초콜릿 트러플", en: "Chocolate truffles", es: "Trufas de chocolate" },
      { ko: "드라이 너츠(호두·피칸)", en: "Dry nuts (walnuts, pecans)", es: "Frutos secos (nueces, pecanas)" },
    ],
    note: {
      ko: "피트 향이 강한 스카치는 훈제 식품과 환상의 궁합을 보이며, 스위트 버번은 초콜릿과 잘 어울린다.",
      en: "Peaty Scotch pairs beautifully with smoked foods; sweet Bourbon complements chocolate perfectly.",
      es: "El Scotch ahumado combina maravillosamente con alimentos ahumados; el Bourbon dulce complementa perfectamente el chocolate.",
    },
  },
  {
    id: "sake",
    emoji: "🍶",
    drink: { ko: "사케(일본 청주)", en: "Sake (Japanese Rice Wine)", es: "Sake (vino de arroz japonés)" },
    pairings: [
      { ko: "스시·사시미", en: "Sushi / sashimi", es: "Sushi / sashimi" },
      { ko: "두부 요리·미소 수프", en: "Tofu dishes / miso soup", es: "Platos de tofu / sopa de miso" },
      { ko: "가리비·새우 구이", en: "Grilled scallops / shrimp", es: "Vieiras / gambas a la parrilla" },
    ],
    note: {
      ko: "사케의 섬세한 감칠맛(우마미)은 해산물과 두부 요리의 깊은 풍미를 더욱 돋보이게 한다.",
      en: "The delicate umami of sake enhances the deep flavours of seafood and tofu dishes.",
      es: "El delicado umami del sake realza los sabores profundos de los mariscos y los platos de tofu.",
    },
  },
  {
    id: "spirits",
    emoji: "🌵",
    drink: { ko: "증류주 (테킬라·럼)", en: "Spirits (Tequila & Rum)", es: "Destilados (Tequila y Ron)" },
    pairings: [
      { ko: "타코·부리토", en: "Tacos / burritos", es: "Tacos / burritos" },
      { ko: "라임·살사 소스를 곁들인 나초", en: "Nachos with lime and salsa", es: "Nachos con limón y salsa" },
      { ko: "코코넛·열대 과일 디저트", en: "Coconut / tropical fruit desserts", es: "Postres de coco / frutas tropicales" },
      { ko: "바비큐 갈비", en: "BBQ ribs", es: "Costillas BBQ" },
    ],
    note: {
      ko: "테킬라의 아가베 향은 라임·소금과 함께 멕시코 음식의 매운맛을 부드럽게 감싼다.",
      en: "Tequila's agave notes, with lime and salt, harmonise beautifully with the spice of Mexican cuisine.",
      es: "Las notas de agave del tequila, con limón y sal, armonizan maravillosamente con el picante de la cocina mexicana.",
    },
  },
  {
    id: "champagne",
    emoji: "🍾",
    drink: { ko: "샴페인·스파클링 와인", en: "Champagne / Sparkling Wine", es: "Champán / Vino espumoso" },
    pairings: [
      { ko: "캐비어·굴", en: "Caviar / oysters", es: "Caviar / ostras" },
      { ko: "연질 치즈(브리·카망베르)", en: "Soft cheese (brie, camembert)", es: "Queso blando (brie, camembert)" },
      { ko: "과일 타르트·마카롱", en: "Fruit tarts / macarons", es: "Tartas de frutas / macarons" },
      { ko: "튀긴 새우·템푸라", en: "Fried shrimp / tempura", es: "Gambas fritas / tempura" },
    ],
    note: {
      ko: "샴페인의 풍부한 기포와 산도는 짭조름하거나 바삭한 음식과 만났을 때 최고의 조화를 이룬다.",
      en: "Champagne's fine bubbles and acidity create a perfect balance with salty or crispy foods.",
      es: "Las finas burbujas y la acidez del champán crean un equilibrio perfecto con alimentos salados o crujientes.",
    },
  },
  {
    id: "cheongju",
    emoji: "🏺",
    drink: { ko: "전통주 (청주·약주)", en: "Korean Traditional Wine (Cheongju/Yakju)", es: "Vino tradicional coreano (Cheongju/Yakju)" },
    pairings: [
      { ko: "전통 전류(녹두전·동태전)", en: "Traditional Korean pancakes (bindaetteok, pollock pancake)", es: "Tortitas coreanas tradicionales (bindaetteok, tortita de abadejo)" },
      { ko: "구절판·신선로", en: "Gujeolpan (nine-section platter) / Sinseollo (royal hot pot)", es: "Gujeolpan (bandeja de nueve secciones) / Sinseollo (olla imperial)" },
      { ko: "갈비찜·불고기", en: "Braised short ribs / Bulgogi", es: "Costillas estofadas / Bulgogi" },
    ],
    note: {
      ko: "청주의 은은한 단맛과 향은 간장 기반 조리 음식과 만나면 감칠맛이 배가된다.",
      en: "Cheongju's subtle sweetness and aroma amplify the umami of soy-based Korean dishes.",
      es: "El sutil dulzor y aroma del cheongju amplifican el umami de los platos coreanos a base de soja.",
    },
  },
] as const;
