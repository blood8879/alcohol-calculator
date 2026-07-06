import { LocalizedText } from "../utils/localizedText";

export type DailyTipCategory =
  | "abv"
  | "calorie"
  | "safety"
  | "culture"
  | "cocktail"
  | "health";

export type DailyTip = {
  id: string;
  emoji: string;
  category: DailyTipCategory;
  text: LocalizedText;
};

/**
 * Evergreen "tip of the day" pool. The home hub rotates through these by day
 * index so the daily surface stays fresh for weeks instead of repeating every
 * few days. Content is factual and safety-oriented, not medical or legal advice.
 */
export const dailyTips: DailyTip[] = [
  {
    id: "tip-beer-standard",
    emoji: "🍺",
    category: "abv",
    text: {
      ko: "맥주 500ml(5%)는 순알코올 약 20g으로 표준잔 1.4잔 정도입니다.",
      en: "A 500ml beer (5%) holds about 20g of pure alcohol — roughly 1.4 standard drinks.",
      es: "Una cerveza de 500ml (5%) tiene unos 20g de alcohol puro: casi 1,4 tragos estándar.",
    },
  },
  {
    id: "tip-soju-bottle",
    emoji: "🍶",
    category: "abv",
    text: {
      ko: "소주 한 병(360ml, 17%)은 순알코올 약 49g으로 표준잔 3.5잔에 해당합니다.",
      en: "One soju bottle (360ml, 17%) is about 49g of pure alcohol — around 3.5 standard drinks.",
      es: "Una botella de soju (360ml, 17%) tiene unos 49g de alcohol puro: unos 3,5 tragos.",
    },
  },
  {
    id: "tip-metabolism-rate",
    emoji: "⏳",
    category: "health",
    text: {
      ko: "몸은 보통 시간당 표준잔 약 1잔(BAC 0.015%)을 분해합니다. 빨리 깨는 지름길은 없습니다.",
      en: "The body clears about one standard drink (0.015% BAC) per hour. There is no shortcut to sober up faster.",
      es: "El cuerpo elimina ~1 trago (0,015% BAC) por hora. No hay atajos para despejarse.",
    },
  },
  {
    id: "tip-empty-stomach",
    emoji: "🍽️",
    category: "safety",
    text: {
      ko: "빈속에 마시면 알코올 흡수가 빨라져 같은 양에도 더 빨리 취합니다. 안주를 곁들이세요.",
      en: "Drinking on an empty stomach speeds absorption, so you feel it sooner. Eat while you drink.",
      es: "Con el estómago vacío el alcohol se absorbe más rápido. Come mientras bebes.",
    },
  },
  {
    id: "tip-water-pace",
    emoji: "💧",
    category: "health",
    text: {
      ko: "술 한 잔마다 물 한 잔을 번갈아 마시면 탈수와 숙취를 크게 줄일 수 있습니다.",
      en: "Alternating a glass of water with each drink reduces dehydration and hangover severity.",
      es: "Alternar un vaso de agua con cada trago reduce la deshidratación y la resaca.",
    },
  },
  {
    id: "tip-wine-calories",
    emoji: "🍷",
    category: "calorie",
    text: {
      ko: "레드와인 한 잔(150ml)은 약 125kcal — 알코올 자체가 1g당 7kcal로 칼로리가 높습니다.",
      en: "A glass of red wine (150ml) is about 125 kcal — alcohol itself packs 7 kcal per gram.",
      es: "Una copa de vino tinto (150ml) tiene ~125 kcal; el alcohol aporta 7 kcal por gramo.",
    },
  },
  {
    id: "tip-proof-meaning",
    emoji: "🔢",
    category: "abv",
    text: {
      ko: "미국 '프루프(proof)'는 도수의 2배입니다. 80 proof 위스키는 도수 40%입니다.",
      en: "US 'proof' is twice the ABV. An 80-proof whiskey is 40% alcohol.",
      es: "El 'proof' de EE. UU. es el doble del ABV. Un whisky 80-proof es 40% de alcohol.",
    },
  },
  {
    id: "tip-distilled-vs-brewed",
    emoji: "⚗️",
    category: "culture",
    text: {
      ko: "양조주는 발효까지, 증류주는 발효 후 증류해 도수를 높인 술입니다. 소주·위스키가 증류주입니다.",
      en: "Brewed drinks stop at fermentation; spirits are distilled afterward to raise ABV. Soju and whiskey are spirits.",
      es: "Los fermentados paran en la fermentación; los destilados se destilan después. Soju y whisky son destilados.",
    },
  },
  {
    id: "tip-makgeolli-shake",
    emoji: "🥛",
    category: "culture",
    text: {
      ko: "막걸리는 가라앉은 효모를 가볍게 흔들어 섞으면 본래의 부드러운 맛이 살아납니다.",
      en: "Gently swirl makgeolli to remix the settled yeast — that's where its creamy flavor lives.",
      es: "Agita suavemente el makgeolli para remezclar la levadura: ahí está su sabor cremoso.",
    },
  },
  {
    id: "tip-clear-spirits-hangover",
    emoji: "🌅",
    category: "health",
    text: {
      ko: "위스키·브랜디 등 색이 진한 술은 콘제너가 많아 일반적으로 숙취를 더 유발합니다.",
      en: "Darker spirits like whiskey and brandy carry more congeners, which tend to worsen hangovers.",
      es: "Los destilados oscuros (whisky, brandy) tienen más congéneres y suelen empeorar la resaca.",
    },
  },
  {
    id: "tip-highball-ratio",
    emoji: "🫧",
    category: "cocktail",
    text: {
      ko: "기본 하이볼은 위스키 1 : 탄산수 3~4 비율. 얼음을 가득 채워야 끝까지 시원합니다.",
      en: "A classic highball is 1 part whiskey to 3–4 parts soda. Fill the glass with ice to keep it crisp.",
      es: "Un highball clásico es 1 de whisky por 3–4 de soda. Llena el vaso de hielo para mantenerlo fresco.",
    },
  },
  {
    id: "tip-standard-drink-def",
    emoji: "📏",
    category: "safety",
    text: {
      ko: "표준잔 1잔은 순알코올 약 14g 기준입니다. 술 종류가 달라도 같은 잣대로 비교할 수 있습니다.",
      en: "One standard drink is about 14g of pure alcohol — a single yardstick across different drinks.",
      es: "Un trago estándar son ~14g de alcohol puro: una misma vara para comparar bebidas.",
    },
  },
  {
    id: "tip-mixers-calories",
    emoji: "🥤",
    category: "calorie",
    text: {
      ko: "콜라·토닉 같은 단 믹서는 칵테일 칼로리를 크게 올립니다. 탄산수로 바꾸면 절감됩니다.",
      en: "Sugary mixers like cola or tonic add a lot of calories. Swapping in soda water cuts them down.",
      es: "Los refrescos azucarados suman muchas calorías. Cambiarlos por agua con gas las reduce.",
    },
  },
  {
    id: "tip-shaken-stirred",
    emoji: "🍸",
    category: "cocktail",
    text: {
      ko: "주스·크림이 든 칵테일은 셰이크, 술만 섞는 마티니·네그로니는 젓는(stir) 것이 정석입니다.",
      en: "Shake cocktails with juice or cream; stir spirit-only drinks like a Martini or Negroni.",
      es: "Agita los cócteles con zumo o crema; remueve los de solo licor como Martini o Negroni.",
    },
  },
  {
    id: "tip-tolerance-myth",
    emoji: "🧠",
    category: "health",
    text: {
      ko: "주량이 늘었다고 느껴도 혈중 알코올이 몸에 주는 부담은 그대로입니다.",
      en: "Feeling 'used to it' doesn't lower the load alcohol puts on your body at the same BAC.",
      es: "Sentir que 'aguantas más' no reduce la carga que el alcohol pone en tu cuerpo.",
    },
  },
  {
    id: "tip-sparkling-bubbles",
    emoji: "🍾",
    category: "culture",
    text: {
      ko: "스파클링 와인의 기포는 알코올 흡수를 살짝 빠르게 해, 같은 도수라도 빨리 취할 수 있습니다.",
      en: "The bubbles in sparkling wine speed absorption a little, so it can hit faster at the same ABV.",
      es: "Las burbujas del espumoso aceleran un poco la absorción: puede subir más rápido.",
    },
  },
  {
    id: "tip-freezing-point",
    emoji: "❄️",
    category: "abv",
    text: {
      ko: "도수가 높을수록 어는점이 낮습니다. 도수 40% 술은 가정용 냉동고에서도 얼지 않습니다.",
      en: "Higher ABV means a lower freezing point. A 40% spirit won't freeze in a home freezer.",
      es: "Más ABV significa menor punto de congelación. Un destilado al 40% no se congela en casa.",
    },
  },
  {
    id: "tip-serving-temp-wine",
    emoji: "🌡️",
    category: "culture",
    text: {
      ko: "레드와인은 16~18°C, 화이트·스파클링은 8~12°C에서 향이 가장 잘 살아납니다.",
      en: "Red wine shows best at 16–18°C; whites and sparkling at 8–12°C.",
      es: "El vino tinto luce mejor a 16–18°C; blancos y espumosos a 8–12°C.",
    },
  },
  {
    id: "tip-soju-serving",
    emoji: "🍶",
    category: "abv",
    text: {
      ko: "소주는 도수보다 '몇 잔을 마셨는지'가 핵심입니다. ml와 도수를 함께 기록하세요.",
      en: "With soju, how many glasses matters as much as ABV. Log volume and ABV together.",
      es: "Con soju, cuántos vasos importa tanto como el ABV. Registra volumen y ABV juntos.",
    },
  },
  {
    id: "tip-electrolytes",
    emoji: "🧂",
    category: "health",
    text: {
      ko: "음주 후 전해질(나트륨·칼륨) 보충은 수분 균형 회복에 도움이 됩니다.",
      en: "Replenishing electrolytes (sodium, potassium) after drinking helps restore fluid balance.",
      es: "Reponer electrolitos (sodio, potasio) tras beber ayuda a recuperar el equilibrio de líquidos.",
    },
  },
  {
    id: "tip-bac-driving",
    emoji: "🚫",
    category: "safety",
    text: {
      ko: "BAC 추정치는 참고용일 뿐입니다. 마셨다면 운전대를 잡지 마세요 — 가장 안전한 기준은 0입니다.",
      en: "BAC estimates are references only. If you drank, don't drive — the safest limit is zero.",
      es: "El BAC estimado es solo referencia. Si bebiste, no conduzcas: el límite más seguro es cero.",
    },
  },
  {
    id: "tip-champagne-flute",
    emoji: "🥂",
    category: "culture",
    text: {
      ko: "샴페인은 좁은 플루트 잔에 따라야 기포가 오래 유지됩니다.",
      en: "Serve champagne in a narrow flute to keep the bubbles alive longer.",
      es: "Sirve el champán en copa flauta estrecha para conservar las burbujas.",
    },
  },
  {
    id: "tip-gin-botanicals",
    emoji: "🫒",
    category: "culture",
    text: {
      ko: "진의 핵심 향은 주니퍼베리입니다. 토닉과 라임만 더해도 향이 살아납니다.",
      en: "Gin's signature aroma comes from juniper berries. Tonic and lime are enough to show it off.",
      es: "El aroma del gin viene de las bayas de enebro. Tónica y lima bastan para realzarlo.",
    },
  },
  {
    id: "tip-calorie-spirits",
    emoji: "🔥",
    category: "calorie",
    text: {
      ko: "도수가 높은 증류주는 같은 양이면 칼로리도 높습니다. 위스키 30ml는 약 70kcal입니다.",
      en: "Higher-proof spirits pack more calories per volume. A 30ml whiskey pour is about 70 kcal.",
      es: "Los destilados fuertes tienen más calorías por volumen. 30ml de whisky son ~70 kcal.",
    },
  },
  {
    id: "tip-pace-drinks",
    emoji: "🐢",
    category: "safety",
    text: {
      ko: "시간당 한 잔 이하로 천천히 마시면 몸의 분해 속도를 넘지 않아 덜 취합니다.",
      en: "Pacing under one drink per hour keeps you within the body's clearance rate.",
      es: "Beber menos de un trago por hora te mantiene dentro de la tasa de eliminación del cuerpo.",
    },
  },
  {
    id: "tip-sake-temp",
    emoji: "🍶",
    category: "culture",
    text: {
      ko: "사케는 차갑게도, 데워서도 즐깁니다. 고급 사케일수록 차게 마셔 향을 살립니다.",
      en: "Sake can be served chilled or warm. Finer sake is usually chilled to preserve aroma.",
      es: "El sake se sirve frío o tibio. El sake fino suele tomarse frío para conservar su aroma.",
    },
  },
  {
    id: "tip-vermouth-fresh",
    emoji: "🍷",
    category: "cocktail",
    text: {
      ko: "베르무트는 와인 기반이라 개봉 후 냉장 보관하고 몇 주 안에 쓰는 것이 좋습니다.",
      en: "Vermouth is wine-based — refrigerate after opening and use within a few weeks.",
      es: "El vermut es a base de vino: refrigéralo tras abrir y úsalo en pocas semanas.",
    },
  },
  {
    id: "tip-blending-abv",
    emoji: "🧪",
    category: "abv",
    text: {
      ko: "두 술을 섞으면 최종 도수는 각 부피와 도수의 가중평균입니다. 블렌딩 계산기로 확인하세요.",
      en: "Mixing two drinks gives a volume-weighted average ABV. Check it with the blending calculator.",
      es: "Mezclar dos bebidas da un ABV promedio ponderado por volumen. Úsalo en la calculadora de mezcla.",
    },
  },
  {
    id: "tip-tequila-agave",
    emoji: "🌵",
    category: "culture",
    text: {
      ko: "100% 아가베 데킬라는 첨가당이 없어 일반적으로 숙취가 덜한 편입니다.",
      en: "100% agave tequila has no added sugars and tends to be gentler the next day.",
      es: "El tequila 100% agave no lleva azúcares añadidos y suele sentar mejor al día siguiente.",
    },
  },
  {
    id: "tip-beer-head",
    emoji: "🍺",
    category: "culture",
    text: {
      ko: "맥주 거품은 탄산과 향을 가둬 맛을 지킵니다. 잔을 기울여 따르면 거품이 적당해집니다.",
      en: "Beer foam traps carbonation and aroma. Pour at an angle for the right amount of head.",
      es: "La espuma de la cerveza retiene gas y aroma. Sirve inclinando el vaso para la espuma justa.",
    },
  },
  {
    id: "tip-cocktail-ice",
    emoji: "🧊",
    category: "cocktail",
    text: {
      ko: "큰 얼음은 천천히 녹아 칵테일이 덜 묽어집니다. 온더록스에는 큰 큐브가 유리합니다.",
      en: "Large ice melts slowly and dilutes less. Use big cubes for drinks served on the rocks.",
      es: "El hielo grande se derrite lento y diluye menos. Usa cubos grandes para tragos on the rocks.",
    },
  },
  {
    id: "tip-aperitif-digestif",
    emoji: "🍹",
    category: "culture",
    text: {
      ko: "식전주(아페리티프)는 입맛을 돋우고, 식후주(디제스티프)는 소화를 돕는 전통입니다.",
      en: "Aperitifs open the appetite; digestifs traditionally close the meal to aid digestion.",
      es: "Los aperitivos abren el apetito; los digestivos cierran la comida para ayudar a digerir.",
    },
  },
  {
    id: "tip-rum-types",
    emoji: "🏴‍☠️",
    category: "culture",
    text: {
      ko: "화이트 럼은 가볍고 칵테일에, 다크 럼은 숙성 풍미가 강해 단독으로도 즐깁니다.",
      en: "White rum is light and great in cocktails; dark rum's aged depth shines on its own.",
      es: "El ron blanco es ligero para cócteles; el oscuro luce solo por su crianza.",
    },
  },
  {
    id: "tip-hydrate-before-bed",
    emoji: "🛏️",
    category: "health",
    text: {
      ko: "잠들기 전 물 한두 잔을 마셔두면 다음 날 탈수 증상이 한결 가볍습니다.",
      en: "A glass or two of water before bed makes next-morning dehydration noticeably milder.",
      es: "Uno o dos vasos de agua antes de dormir alivian mucho la deshidratación de la mañana.",
    },
  },
  {
    id: "tip-low-abv-trend",
    emoji: "🌿",
    category: "health",
    text: {
      ko: "저도수·무알코올 음료를 섞어 마시면 총 알코올 섭취량을 자연스럽게 줄일 수 있습니다.",
      en: "Mixing in low- or no-alcohol drinks is an easy way to lower total intake over a night.",
      es: "Intercalar bebidas de baja graduación o sin alcohol reduce fácilmente el consumo total.",
    },
  },
  {
    id: "tip-wine-tannin",
    emoji: "🍷",
    category: "culture",
    text: {
      ko: "레드와인의 떫은맛은 타닌 때문입니다. 기름진 고기와 만나면 부드럽게 느껴집니다.",
      en: "Red wine's grip comes from tannins, which feel softer alongside fatty meats.",
      es: "La aspereza del tinto viene de los taninos, que se suavizan con carnes grasas.",
    },
  },
  {
    id: "tip-cocktail-balance",
    emoji: "⚖️",
    category: "cocktail",
    text: {
      ko: "좋은 칵테일은 술·신맛·단맛의 균형입니다. 사워류는 보통 2:1:1 비율에서 출발합니다.",
      en: "A good cocktail balances spirit, sour, and sweet. Sours often start from a 2:1:1 ratio.",
      es: "Un buen cóctel equilibra licor, ácido y dulce. Los sours parten de una proporción 2:1:1.",
    },
  },
  {
    id: "tip-calorie-beer-light",
    emoji: "🔥",
    category: "calorie",
    text: {
      ko: "같은 용량이면 도수가 낮은 라거가 진한 에일·스타우트보다 칼로리가 낮은 편입니다.",
      en: "At equal volume, lower-ABV lagers usually carry fewer calories than rich ales or stouts.",
      es: "A igual volumen, las lager de menor ABV suelen tener menos calorías que ales o stouts.",
    },
  },
  {
    id: "tip-night-cap-myth",
    emoji: "😴",
    category: "health",
    text: {
      ko: "자기 전 술 한 잔은 잠들기는 쉬워도 수면의 질을 떨어뜨려 다음 날 더 피곤합니다.",
      en: "A nightcap may help you fall asleep but fragments sleep, leaving you more tired.",
      es: "Una copa antes de dormir ayuda a conciliar el sueño pero lo fragmenta y cansa más.",
    },
  },
  {
    id: "tip-garnish-purpose",
    emoji: "🍋",
    category: "cocktail",
    text: {
      ko: "가니시는 장식이 아니라 향입니다. 레몬·라임 껍질을 비틀어 오일을 뿌리면 향이 확 삽니다.",
      en: "Garnishes are aroma, not decoration. Twisting citrus peel sprays oils that lift the drink.",
      es: "La decoración es aroma, no adorno. Retorcer la piel de cítrico libera aceites que realzan.",
    },
  },
  {
    id: "tip-unit-conversion",
    emoji: "🔄",
    category: "abv",
    text: {
      ko: "1온스(oz)는 약 30ml입니다. 해외 레시피의 oz는 단위 변환기로 빠르게 ml로 바꿔보세요.",
      en: "One ounce is about 30ml. Convert oz in foreign recipes to ml with the unit converter.",
      es: "Una onza son ~30ml. Convierte las oz de recetas extranjeras a ml con el conversor.",
    },
  },
  {
    id: "tip-spacing-days",
    emoji: "📅",
    category: "health",
    text: {
      ko: "주중 음주 없는 날을 정해두면 전체 섭취량을 줄이고 몸의 회복 시간을 확보할 수 있습니다.",
      en: "Setting alcohol-free days each week lowers total intake and gives your body time to recover.",
      es: "Fijar días sin alcohol cada semana reduce el consumo total y da tiempo a recuperarte.",
    },
  },
  // ── ABV (신규 8개) ──────────────────────────────────────────────────────────
  {
    id: "tip-abv-champagne",
    emoji: "🥂",
    category: "abv",
    text: {
      ko: "샴페인·스파클링 와인의 도수는 보통 11~12%로, 일반 레드와인(13~15%)보다 낮습니다.",
      en: "Champagne and sparkling wine typically come in at 11–12% ABV, lower than most red wines at 13–15%.",
      es: "El champán y el espumoso suelen tener 11–12% de ABV, menos que la mayoría de los tintos (13–15%).",
    },
  },
  {
    id: "tip-abv-beer-styles",
    emoji: "🍺",
    category: "abv",
    text: {
      ko: "맥주 스타일별 도수 범위: 라거 4~5%, IPA 6~7%, 임페리얼 스타우트는 8~12%까지 다양합니다.",
      en: "Beer ABV varies widely by style: lagers 4–5%, IPAs 6–7%, imperial stouts can reach 8–12%.",
      es: "El ABV de la cerveza varía por estilo: lager 4–5%, IPA 6–7%, stout imperial hasta 8–12%.",
    },
  },
  {
    id: "tip-abv-wine-range",
    emoji: "🍷",
    category: "abv",
    text: {
      ko: "와인 도수는 8~16%로 폭이 넓습니다. 레이블에 명시된 수치를 확인하는 습관을 들이세요.",
      en: "Wine ABV ranges from 8% to 16%. Make it a habit to check the label before pouring.",
      es: "El ABV del vino va del 8% al 16%. Acostúmbrate a revisar la etiqueta antes de servir.",
    },
  },
  {
    id: "tip-abv-sake-range",
    emoji: "🍶",
    category: "abv",
    text: {
      ko: "사케 도수는 보통 14~16%로 와인과 비슷합니다. 일부 저도수 사케는 7~8%대도 있습니다.",
      en: "Sake usually sits at 14–16% ABV, similar to wine, though some low-ABV styles drop to 7–8%.",
      es: "El sake suele tener 14–16% de ABV, similar al vino, aunque algunos estilos de baja graduación bajan al 7–8%.",
    },
  },
  {
    id: "tip-abv-cocktail-dilution",
    emoji: "🧪",
    category: "abv",
    text: {
      ko: "얼음과 함께 셰이킹·스터링하면 10~20% 정도 희석되어 칵테일의 최종 도수가 낮아집니다.",
      en: "Shaking or stirring with ice dilutes a cocktail by 10–20%, lowering its effective ABV.",
      es: "Agitar o remover con hielo diluye un cóctel un 10–20%, reduciendo su ABV efectivo.",
    },
  },
  {
    id: "tip-standard-drink-formula",
    emoji: "⚖️",
    category: "abv",
    text: {
      ko: "순알코올(g) = 음료량(ml) × 도수(%) × 0.0079. 이 공식으로 어떤 술이든 계산할 수 있습니다.",
      en: "Pure alcohol (g) = volume (ml) × ABV (%) × 0.0079. Use this formula to calculate any drink.",
      es: "Alcohol puro (g) = volumen (ml) × ABV (%) × 0,0079. Usa esta fórmula para calcular cualquier bebida.",
    },
  },
  {
    id: "tip-abv-non-alcoholic",
    emoji: "🌱",
    category: "abv",
    text: {
      ko: "도수 0.5% 미만은 대부분의 나라에서 무알코올로 분류됩니다. 시중 무알코올 맥주 대부분이 여기에 해당합니다.",
      en: "Drinks below 0.5% ABV are classified as non-alcoholic in most countries — most 'alcohol-free' beers qualify.",
      es: "Las bebidas con menos del 0,5% ABV se clasifican como sin alcohol en la mayoría de países.",
    },
  },
  {
    id: "tip-abv-spirits-minimum",
    emoji: "🥃",
    category: "abv",
    text: {
      ko: "EU 위스키와 미국 버번은 법적으로 최소 도수 40%를 충족해야 합니다. 나라마다 기준이 다릅니다.",
      en: "EU whisky and US bourbon are legally required to be at least 40% ABV. Minimum thresholds vary by country.",
      es: "El whisky de la UE y el bourbon de EE. UU. requieren por ley al menos 40% de ABV. Los mínimos varían por país.",
    },
  },
  // ── CALORIE (신규 8개) ───────────────────────────────────────────────────────
  {
    id: "tip-calorie-margarita",
    emoji: "🍹",
    category: "calorie",
    text: {
      ko: "클래식 마르가리타 한 잔은 약 200~250kcal입니다. 생 라임즙을 쓰면 시럽 믹스보다 당류를 줄일 수 있습니다.",
      en: "A classic margarita is about 200–250 kcal. Fresh lime juice keeps sugar lower than a pre-made mix.",
      es: "Una margarita clásica tiene ~200–250 kcal. El jugo de lima fresco reduce el azúcar frente a los preparados.",
    },
  },
  {
    id: "tip-calorie-soju-glass",
    emoji: "🍶",
    category: "calorie",
    text: {
      ko: "소주 한 잔(50ml, 17%)은 약 56kcal입니다. 한 병(360ml)을 다 마시면 약 400kcal가 됩니다.",
      en: "One soju glass (50ml, 17%) has about 56 kcal. Finish the whole bottle (360ml) and that's ~400 kcal.",
      es: "Un vaso de soju (50ml, 17%) tiene ~56 kcal. Terminar la botella (360ml) son unos 400 kcal.",
    },
  },
  {
    id: "tip-calorie-craft-beer",
    emoji: "🍺",
    category: "calorie",
    text: {
      ko: "크래프트 IPA 500ml(7%)는 약 250kcal로, 공기밥 한 공기와 비슷한 열량입니다.",
      en: "A 500ml craft IPA at 7% is about 250 kcal — similar to a bowl of steamed rice.",
      es: "Una IPA artesanal de 500ml al 7% tiene ~250 kcal, equivalente a un cuenco de arroz cocido.",
    },
  },
  {
    id: "tip-calorie-liqueur",
    emoji: "🍫",
    category: "calorie",
    text: {
      ko: "베일리스·깔루아 같은 리큐어는 당분이 많아 같은 양의 위스키보다 칼로리가 훨씬 높습니다.",
      en: "Liqueurs like Baileys or Kahlúa are high in sugar and pack far more calories than the same amount of whiskey.",
      es: "Los licores como Baileys o Kahlúa tienen mucho azúcar y más calorías que la misma cantidad de whisky.",
    },
  },
  {
    id: "tip-calorie-alcohol-density",
    emoji: "🔥",
    category: "calorie",
    text: {
      ko: "알코올은 지방이 아니지만 g당 7kcal로 단백질·탄수화물(각 4kcal)보다 열량 밀도가 높습니다.",
      en: "Alcohol isn't fat, but at 7 kcal/g it's more calorie-dense than protein or carbohydrates (4 kcal/g each).",
      es: "El alcohol no es grasa, pero con 7 kcal/g es más calórico que proteínas o carbohidratos (4 kcal/g cada uno).",
    },
  },
  {
    id: "tip-calorie-dry-vs-sweet",
    emoji: "🍷",
    category: "calorie",
    text: {
      ko: "드라이 와인은 잔당이 적어 스위트 와인보다 칼로리가 낮습니다. 라벨의 당도 표기를 확인하세요.",
      en: "Dry wines have less residual sugar and fewer calories than sweet wines. Check the label's sweetness notation.",
      es: "Los vinos secos tienen menos azúcar residual y menos calorías que los dulces. Revisa la notación de dulzor en la etiqueta.",
    },
  },
  {
    id: "tip-calorie-tonic-sugar",
    emoji: "🫧",
    category: "calorie",
    text: {
      ko: "토닉워터 240ml에는 설탕이 약 22g 들어 있습니다. 다이어트 토닉이나 탄산수로 바꾸면 칼로리를 절반 이하로 줄일 수 있습니다.",
      en: "A 240ml tonic water has about 22g of sugar. Switching to diet tonic or soda water cuts calories by half or more.",
      es: "240ml de agua tónica tienen ~22g de azúcar. Cambiar a tónica light o agua con gas reduce las calorías a la mitad.",
    },
  },
  {
    id: "tip-calorie-snacks",
    emoji: "🥜",
    category: "calorie",
    text: {
      ko: "술자리 안주 칼로리는 술 자체보다 더 높을 수 있습니다. 튀긴 안주 대신 채소나 두부를 선택해보세요.",
      en: "Food at a drinking session can easily exceed the drink calories. Try vegetables or tofu instead of fried snacks.",
      es: "Los aperitivos de una sesión pueden superar las calorías de las bebidas. Elige verduras o tofu en vez de fritos.",
    },
  },
  // ── SAFETY (신규 9개) ────────────────────────────────────────────────────────
  {
    id: "tip-dui-korea",
    emoji: "🇰🇷",
    category: "safety",
    text: {
      ko: "한국 음주운전 단속 기준은 혈중알코올농도 0.03% 이상입니다. 소주 한 잔만으로도 초과할 수 있습니다.",
      en: "South Korea's DUI threshold is 0.03% BAC — even one glass of soju can put you over the limit.",
      es: "El umbral de DUI en Corea del Sur es 0,03% BAC; incluso un vaso de soju puede superarlo.",
    },
  },
  {
    id: "tip-dui-usa",
    emoji: "🇺🇸",
    category: "safety",
    text: {
      ko: "미국 대부분의 주에서 음주운전 기준은 혈중알코올농도 0.08%입니다. 상업 운전자는 0.04%가 기준입니다.",
      en: "Most US states set the DUI limit at 0.08% BAC; commercial drivers face a stricter 0.04% threshold.",
      es: "La mayoría de los estados de EE. UU. fijan el DUI en 0,08% BAC; los conductores comerciales tienen el límite en 0,04%.",
    },
  },
  {
    id: "tip-dui-japan",
    emoji: "🇯🇵",
    category: "safety",
    text: {
      ko: "일본의 음주운전 기준은 0.03%로 엄격하며, 음주 운전자인 줄 알고 동승한 사람도 처벌받을 수 있습니다.",
      en: "Japan enforces a strict 0.03% BAC limit, and passengers who knowingly ride with a drunk driver can also be penalized.",
      es: "Japón tiene un límite estricto de 0,03% BAC; los pasajeros que conocían el estado del conductor también pueden ser sancionados.",
    },
  },
  {
    id: "tip-dui-europe",
    emoji: "🇪🇺",
    category: "safety",
    text: {
      ko: "유럽 대부분은 음주운전 기준이 0.05%이며, 체코·슬로바키아·헝가리 등은 0.00%를 적용합니다.",
      en: "Most European countries set DUI at 0.05% BAC; Czech Republic, Slovakia, and Hungary enforce a 0.00% limit.",
      es: "La mayoría de países europeos fijan el DUI en 0,05% BAC; República Checa, Eslovaquia y Hungría aplican el 0,00%.",
    },
  },
  {
    id: "tip-medication-interaction",
    emoji: "💊",
    category: "safety",
    text: {
      ko: "항생제·수면제·항히스타민제 등은 알코올과 상호작용할 수 있습니다. 복용 중인 약이 있다면 음주 전 약사나 의사에게 확인하세요.",
      en: "Antibiotics, sleeping pills, and antihistamines can interact with alcohol. Check with a pharmacist or doctor if you're on any medication.",
      es: "Los antibióticos, somníferos y antihistamínicos pueden interactuar con el alcohol. Consulta a tu farmacéutico o médico si tomas medicación.",
    },
  },
  {
    id: "tip-pregnancy-alcohol",
    emoji: "🤰",
    category: "safety",
    text: {
      ko: "임신 중 안전한 음주량은 과학적으로 알려진 바가 없어, 세계 보건 당국은 완전한 금주를 권고합니다.",
      en: "No safe level of alcohol in pregnancy is established, so health authorities worldwide recommend avoiding it entirely.",
      es: "No existe un nivel seguro de alcohol en el embarazo; las autoridades sanitarias mundiales recomiendan evitarlo por completo.",
    },
  },
  {
    id: "tip-mixing-drink-types",
    emoji: "🌀",
    category: "safety",
    text: {
      ko: "다양한 종류의 술을 섞어 마셔 더 취하는 것은 결국 총 알코올 섭취량이 늘기 때문입니다. 술 종류보다 총량을 관리하세요.",
      en: "Getting drunker from mixing drink types is really about total alcohol consumed. Track total intake, not just drink type.",
      es: "Emborracharse más al mezclar bebidas se debe al total de alcohol consumido. Controla el total, no solo el tipo.",
    },
  },
  {
    id: "tip-designated-driver",
    emoji: "🚗",
    category: "safety",
    text: {
      ko: "음주 전에 그날의 운전 담당자를 미리 정해두면 안전한 귀가를 보장하는 가장 확실한 방법 중 하나입니다.",
      en: "Designating a sober driver before you start drinking is one of the most reliable ways to get home safely.",
      es: "Designar un conductor sobrio antes de empezar a beber es una de las formas más seguras de llegar a casa.",
    },
  },
  {
    id: "tip-alcohol-anxiety",
    emoji: "😰",
    category: "safety",
    text: {
      ko: "음주 후 불안감이나 심박수 증가는 알코올이 신경계를 자극하기 때문입니다. 이런 반응이 반복된다면 전문가와 상담을 고려하세요.",
      en: "Post-drinking anxiety and a racing heart are caused by alcohol stimulating the nervous system. Recurring symptoms are worth discussing with a professional.",
      es: "La ansiedad y las palpitaciones tras beber se deben a la estimulación del sistema nervioso. Los síntomas recurrentes merecen consultar a un profesional.",
    },
  },
  // ── CULTURE (신규 6개) ───────────────────────────────────────────────────────
  {
    id: "tip-storage-wine-horizontal",
    emoji: "🍷",
    category: "culture",
    text: {
      ko: "코르크 마개 와인은 눕혀서 보관해야 코르크가 마르지 않아 장기 보관에 유리합니다.",
      en: "Cork-stoppered wine should be stored on its side to keep the cork moist and preserve the seal long-term.",
      es: "El vino con corcho debe almacenarse de lado para mantener el corcho húmedo y conservar el sello a largo plazo.",
    },
  },
  {
    id: "tip-storage-spirits-upright",
    emoji: "🥃",
    category: "culture",
    text: {
      ko: "도수 높은 증류주는 세워서 보관해야 알코올이 코르크를 손상시키지 않습니다.",
      en: "High-proof spirits should be stored upright — lying them on their side lets the alcohol degrade the cork.",
      es: "Los destilados de alta graduación deben guardarse en vertical; de lado, el alcohol degrada el corcho.",
    },
  },
  {
    id: "tip-culture-toast-world",
    emoji: "🌍",
    category: "culture",
    text: {
      ko: "건배 표현: 한국 '건배', 일본 '칸파이(乾杯)', 스페인 '살루드', 프랑스 '상테', 독일 '프로스트'.",
      en: "Toasts around the world: Korea '건배(geonbae)', Japan '乾杯(kanpai)', Spain 'salud', France 'santé', Germany 'prost'.",
      es: "Brindis en el mundo: Corea '건배(geonbae)', Japón '乾杯(kanpai)', España 'salud', Francia 'santé', Alemania 'prost'.",
    },
  },
  {
    id: "tip-culture-beer-purity",
    emoji: "🇩🇪",
    category: "culture",
    text: {
      ko: "1516년 독일의 맥주순수령(Reinheitsgebot)은 물·보리·홉만 사용하도록 규정한 역사적 식품법입니다.",
      en: "Germany's 1516 Reinheitsgebot limited beer to water, barley, and hops — one of history's oldest food purity laws.",
      es: "La Reinheitsgebot alemana de 1516 limitaba la cerveza a agua, cebada y lúpulo, una de las leyes de pureza alimentaria más antiguas.",
    },
  },
  {
    id: "tip-culture-absinthe",
    emoji: "💚",
    category: "culture",
    text: {
      ko: "압생트는 19세기 유럽 예술가들에게 인기를 끌었으나 20세기 초 많은 나라에서 금지됐다가 현재는 대부분 합법화됐습니다.",
      en: "Absinthe was beloved by 19th-century European artists, banned early in the 20th century, and is now legal again in most countries.",
      es: "El absenta fue amado por artistas europeos del siglo XIX, prohibido a principios del XX y ahora es legal de nuevo en la mayoría de países.",
    },
  },
  {
    id: "tip-storage-opened-wine",
    emoji: "🔒",
    category: "culture",
    text: {
      ko: "개봉한 와인은 마개를 꼭 닫아 냉장 보관하면 3~5일은 풍미를 유지할 수 있습니다.",
      en: "An opened wine bottle, sealed and refrigerated, stays fresh and flavourful for 3–5 days.",
      es: "Una botella de vino abierta, tapada y refrigerada, mantiene su sabor 3–5 días.",
    },
  },
  // ── COCKTAIL (신규 9개) ──────────────────────────────────────────────────────
  {
    id: "tip-cocktail-muddle",
    emoji: "🌿",
    category: "cocktail",
    text: {
      ko: "머들링(muddling)은 허브나 과일을 머들러로 눌러 향을 추출하는 기법입니다. 너무 세게 누르면 쓴맛이 납니다.",
      en: "Muddling is pressing herbs or fruit with a muddler to release aroma. Press too hard and bitterness bleeds in.",
      es: "Muddling es presionar hierbas o fruta con un muddler para liberar su aroma. Presionar demasiado añade amargor.",
    },
  },
  {
    id: "tip-cocktail-build",
    emoji: "🏗️",
    category: "cocktail",
    text: {
      ko: "'빌드(build)'는 재료를 잔에 직접 순서대로 넣는 가장 간단한 칵테일 기법입니다. 하이볼이 대표적입니다.",
      en: "'Build' means adding ingredients directly into the glass in order — the simplest technique. The highball is the classic example.",
      es: "'Build' significa añadir los ingredientes directamente al vaso en orden: la técnica más sencilla. El highball es el ejemplo clásico.",
    },
  },
  {
    id: "tip-cocktail-dash",
    emoji: "💧",
    category: "cocktail",
    text: {
      ko: "'대시(dash)'는 비터스 같은 강한 재료의 소량 단위로 약 0.6ml입니다. 너무 많으면 풍미가 압도됩니다.",
      en: "A 'dash' is a small measure for potent ingredients like bitters — about 0.6ml. Too many and they overwhelm the drink.",
      es: "Un 'dash' es una pequeña medida para ingredientes potentes como los bitters, ~0,6ml. Demasiados dominan el trago.",
    },
  },
  {
    id: "tip-cocktail-float",
    emoji: "🌊",
    category: "cocktail",
    text: {
      ko: "플로팅(floating)은 술을 바 스푼 뒷면 위로 천천히 부어 밀도 차이로 층을 만드는 기법입니다.",
      en: "Floating means pouring a spirit slowly over the back of a bar spoon, using density differences to create distinct layers.",
      es: "El floating consiste en verter un licor lentamente sobre el dorso de la cuchara de bar, usando diferencias de densidad para crear capas.",
    },
  },
  {
    id: "tip-cocktail-dry-shake",
    emoji: "🥚",
    category: "cocktail",
    text: {
      ko: "드라이 셰이크는 얼음 없이 흔드는 기법입니다. 달걀흰자가 든 칵테일에서 거품을 만들기 위해 먼저 씁니다.",
      en: "A dry shake means shaking without ice first — used in egg-white cocktails to build a stable foam before chilling.",
      es: "El dry shake es agitar sin hielo primero; se usa en cócteles con clara de huevo para crear espuma estable antes de enfriar.",
    },
  },
  {
    id: "tip-cocktail-salt-rim",
    emoji: "🧂",
    category: "cocktail",
    text: {
      ko: "잔 테두리의 소금은 짠맛이 단맛·신맛을 강조해 칵테일 맛을 더 입체적으로 만들어줍니다.",
      en: "A salted rim enhances both sweet and sour notes in a cocktail, adding a three-dimensional flavour contrast.",
      es: "El borde salado realza las notas dulces y ácidas del cóctel, añadiendo un contraste de sabor tridimensional.",
    },
  },
  {
    id: "tip-cocktail-summer-spritz",
    emoji: "☀️",
    category: "cocktail",
    text: {
      ko: "여름 칵테일로 스프리츠가 인기입니다. 아페롤·프로세코·탄산수를 3:2:1 비율로 섞으면 쉽게 완성됩니다.",
      en: "The Aperol Spritz is a summer favourite: mix Aperol, Prosecco, and soda water 3:2:1 for an easy, refreshing drink.",
      es: "El Aperol Spritz es favorito del verano: mezcla Aperol, Prosecco y agua con gas 3:2:1 para un trago refrescante y fácil.",
    },
  },
  {
    id: "tip-cocktail-winter-warm",
    emoji: "🍵",
    category: "cocktail",
    text: {
      ko: "겨울 핫 드링크로 뱅쇼(vin chaud)가 있습니다. 레드와인에 계피·정향·오렌지를 넣고 낮은 불로 데우면 됩니다.",
      en: "Vin chaud (mulled wine) is a winter classic: warm red wine with cinnamon, cloves, and orange over low heat.",
      es: "El vin chaud (vino caliente) es un clásico invernal: calienta vino tinto con canela, clavo y naranja a fuego suave.",
    },
  },
  {
    id: "tip-cocktail-mocktail",
    emoji: "🥤",
    category: "cocktail",
    text: {
      ko: "목테일은 알코올 없이 칵테일의 맛과 경험을 재현한 음료입니다. 콤부차·진저비어·허브 시럽으로 다양하게 만들 수 있습니다.",
      en: "Mocktails recreate cocktail flavours without alcohol, using kombucha, ginger beer, or herb syrups.",
      es: "Los mocktails recrean los sabores de los cócteles sin alcohol, usando kombucha, ginger beer o siropes de hierbas.",
    },
  },
  // ── HEALTH (신규 8개) ────────────────────────────────────────────────────────
  {
    id: "tip-health-exercise-after",
    emoji: "🏃",
    category: "health",
    text: {
      ko: "격렬한 운동 직후에는 몸이 탈수 상태일 수 있어, 음주가 회복을 더디게 할 수 있습니다.",
      en: "After intense exercise your body is already dehydrated, so drinking can noticeably slow recovery.",
      es: "Tras un ejercicio intenso el cuerpo ya está deshidratado, por lo que beber puede ralentizar la recuperación.",
    },
  },
  {
    id: "tip-health-sleep-rem",
    emoji: "💤",
    category: "health",
    text: {
      ko: "알코올은 수면 전반부 깊은 잠을 유도하지만 후반부 렘(REM) 수면을 억제해 전반적인 수면의 질을 떨어뜨립니다.",
      en: "Alcohol deepens early sleep but suppresses REM in the second half of the night, reducing overall sleep quality.",
      es: "El alcohol profundiza el sueño inicial pero suprime el REM en la segunda mitad, reduciendo la calidad general del sueño.",
    },
  },
  {
    id: "tip-health-liver-days",
    emoji: "🫁",
    category: "health",
    text: {
      ko: "주중 2~3일 금주 기간을 두면 간이 재생하고 회복할 시간을 가질 수 있습니다.",
      en: "The liver benefits from 2–3 alcohol-free days per week, giving it time to regenerate and recover.",
      es: "El hígado se beneficia de 2–3 días sin alcohol a la semana, lo que le da tiempo para regenerarse y recuperarse.",
    },
  },
  {
    id: "tip-health-b-vitamin",
    emoji: "💊",
    category: "health",
    text: {
      ko: "알코올은 비타민 B1(티아민)을 포함한 B군 비타민을 소모합니다. 자주 마신다면 영양 균형에 신경 쓰세요.",
      en: "Alcohol depletes B vitamins, including B1 (thiamine). If you drink regularly, pay attention to nutritional balance.",
      es: "El alcohol agota las vitaminas B, incluida la B1 (tiamina). Si bebes con regularidad, cuida tu equilibrio nutricional.",
    },
  },
  {
    id: "tip-health-food-before",
    emoji: "🍱",
    category: "health",
    text: {
      ko: "음주 1~2시간 전에 단백질과 지방이 포함된 식사를 하면 알코올 흡수 속도가 느려져 덜 빠르게 취합니다.",
      en: "Eating a meal with protein and fat 1–2 hours before drinking slows alcohol absorption and delays intoxication.",
      es: "Comer una comida con proteínas y grasas 1–2 horas antes de beber ralentiza la absorción del alcohol.",
    },
  },
  {
    id: "tip-health-no-alcohol-benefits",
    emoji: "🌟",
    category: "health",
    text: {
      ko: "무알코올 음료를 선택하면 칼로리를 줄이고 수면의 질을 높이며 다음 날 컨디션 유지에 도움이 됩니다.",
      en: "Choosing non-alcoholic drinks cuts calories, improves sleep quality, and helps you feel better the next day.",
      es: "Elegir bebidas sin alcohol reduce calorías, mejora la calidad del sueño y ayuda a sentirte mejor al día siguiente.",
    },
  },
  {
    id: "tip-health-hangover-cure",
    emoji: "🥒",
    category: "health",
    text: {
      ko: "숙취를 빠르게 해소하는 음식이나 음료는 과학적으로 증명된 것이 없습니다. 시간과 수분 보충이 가장 확실한 방법입니다.",
      en: "No food or drink has been scientifically proven to cure a hangover. Time and hydration remain the most reliable remedies.",
      es: "Ningún alimento o bebida ha demostrado curar la resaca científicamente. El tiempo y la hidratación son los remedios más fiables.",
    },
  },
  {
    id: "tip-health-moderate-guideline",
    emoji: "📋",
    category: "health",
    text: {
      ko: "많은 보건 기관에서 '저위험 음주'를 주당 표준잔 14잔(남성) 또는 7잔(여성) 미만으로 제시하지만, 개인차가 있습니다.",
      en: "Many health bodies define 'low-risk' drinking as fewer than 14 standard drinks per week for men and 7 for women, though individual variation applies.",
      es: "Muchos organismos de salud definen el consumo 'de bajo riesgo' como menos de 14 tragos estándar semanales para hombres y 7 para mujeres, con variación individual.",
    },
  },
];

export const getDailyTip = (date = new Date()): DailyTip => {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return dailyTips[dayIndex % dailyTips.length];
};
