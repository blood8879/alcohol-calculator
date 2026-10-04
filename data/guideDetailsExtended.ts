import type { GuideDetail } from "./guideDetails";

/**
 * Deep-dive guide content for the encyclopedia entries that previously had no
 * detail panel. Kept in a separate file so the original curated set stays
 * untouched; guideDetails.ts merges both. Content is factual and
 * safety-oriented, not medical or legal advice.
 */
export const extendedGuideDetails: readonly GuideDetail[] = [
  {
    entryId: "white-wine",
    title: {
      ko: "화이트 와인은 차게 마실수록 향이 또렷해집니다",
      en: "White wine shows its aroma best when chilled",
      es: "El vino blanco luce su aroma mejor bien frío",
    },
    summary: {
      ko: "화이트 와인은 보통 10~14도로 레드보다 가볍지만, 단맛이 강한 종류는 칼로리가 더 높을 수 있습니다.",
      en: "White wine is usually 10-14% ABV and lighter than red, but sweeter styles can carry more calories.",
      es: "El vino blanco suele tener 10-14% ABV, más ligero que el tinto, pero los dulces tienen más calorías.",
    },
    quickFacts: [
      {
        ko: "8~12도에서 서빙하면 산미와 과일 향이 가장 잘 살아납니다.",
        en: "Serving at 8-12°C keeps acidity and fruit aromas crisp.",
        es: "Servir a 8-12°C mantiene la acidez y el aroma frutal.",
      },
      {
        ko: "드라이한 화이트가 스위트 와인보다 일반적으로 칼로리가 낮습니다.",
        en: "Dry whites are generally lower in calories than sweet ones.",
        es: "Los blancos secos suelen tener menos calorías que los dulces.",
      },
    ],
    relatedRecipeIds: ["aperol-spritz", "cosmopolitan"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "와인 칼로리 계산하기",
        en: "Estimate wine calories",
        es: "Calcular calorías del vino",
      },
      target: "/(tabs)/tracker",
    },
  },
  {
    entryId: "sparkling-wine",
    title: {
      ko: "스파클링 와인은 기포가 흡수 속도를 살짝 높입니다",
      en: "Sparkling wine's bubbles speed absorption a little",
      es: "Las burbujas del espumoso aceleran la absorción",
    },
    summary: {
      ko: "탄산이 위 배출을 빠르게 해 같은 도수라도 더 빨리 취할 수 있습니다. 천천히 즐기세요.",
      en: "Carbonation empties the stomach faster, so it can hit sooner at the same ABV. Pace yourself.",
      es: "El gas vacía el estómago más rápido, así que puede subir antes. Ve con calma.",
    },
    quickFacts: [
      {
        ko: "좁은 플루트 잔은 기포를 오래 유지해 향을 지켜줍니다.",
        en: "A narrow flute preserves bubbles and aroma longer.",
        es: "Una copa flauta conserva burbujas y aroma por más tiempo.",
      },
      {
        ko: "브뤼(brut)는 당이 적어 스위트 타입보다 칼로리가 낮습니다.",
        en: "Brut styles have less sugar and fewer calories than sweet ones.",
        es: "Los brut tienen menos azúcar y menos calorías que los dulces.",
      },
    ],
    relatedRecipeIds: ["aperol-spritz"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "스파클링 레시피 보기",
        en: "Open sparkling recipes",
        es: "Ver recetas con espumoso",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "vodka",
    title: {
      ko: "보드카는 향이 옅어 믹서 선택이 맛을 좌우합니다",
      en: "Vodka is neutral, so the mixer makes the drink",
      es: "El vodka es neutro: la mezcla define el trago",
    },
    summary: {
      ko: "도수는 40도 전후로 높지만 향이 깔끔해 칵테일 베이스로 자주 쓰입니다. 단 믹서는 칼로리를 크게 올립니다.",
      en: "Near 40% ABV but clean in flavor, vodka is a popular cocktail base. Sweet mixers raise calories fast.",
      es: "Cerca de 40% ABV pero de sabor limpio, el vodka es base habitual. Los refrescos dulces suben calorías.",
    },
    quickFacts: [
      {
        ko: "30ml 한 샷도 표준잔에 가깝습니다. 잔 수보다 원액량을 기록하세요.",
        en: "A 30ml shot is close to one standard drink. Log base volume, not glass count.",
        es: "Un shot de 30ml se acerca a un trago estándar. Registra el volumen base.",
      },
      {
        ko: "탄산수와 라임만 더하면 칼로리를 낮게 유지할 수 있습니다.",
        en: "Soda water and lime keep the calorie count low.",
        es: "Agua con gas y lima mantienen las calorías bajas.",
      },
    ],
    relatedRecipeIds: ["moscow-mule", "cosmopolitan", "bloody-mary", "espresso-martini"],
    relatedQuizCategory: "cocktails",
    nextStep: {
      label: {
        ko: "보드카 칵테일 비교하기",
        en: "Compare vodka cocktails",
        es: "Comparar cócteles con vodka",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "rum",
    title: {
      ko: "럼은 화이트와 다크의 쓰임새가 다릅니다",
      en: "White and dark rum serve different roles",
      es: "El ron blanco y el oscuro cumplen papeles distintos",
    },
    summary: {
      ko: "화이트 럼은 가볍게 칵테일에, 다크 럼은 숙성 풍미로 단독으로도 즐깁니다. 도수는 보통 40도 전후입니다.",
      en: "White rum is light for cocktails; dark rum's aged depth works neat too. Usually around 40% ABV.",
      es: "El ron blanco es ligero para cócteles; el oscuro luce solo. Suele rondar 40% ABV.",
    },
    quickFacts: [
      {
        ko: "모히토·다이키리는 화이트 럼, 묵직한 칵테일엔 다크 럼이 어울립니다.",
        en: "Use white rum for mojitos and daiquiris, dark rum for richer drinks.",
        es: "Usa ron blanco para mojitos y daiquiris, oscuro para tragos intensos.",
      },
      {
        ko: "코코넛 크림·주스가 들어가면 칼로리가 빠르게 올라갑니다.",
        en: "Coconut cream or juice can raise calories quickly.",
        es: "La crema de coco o el zumo suben las calorías rápido.",
      },
    ],
    relatedRecipeIds: ["mojito", "daiquiri", "pina-colada"],
    relatedQuizCategory: "cocktails",
    nextStep: {
      label: {
        ko: "럼 레시피 살펴보기",
        en: "Explore rum recipes",
        es: "Explorar recetas con ron",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "gin",
    title: {
      ko: "진의 개성은 주니퍼와 보타니컬에서 나옵니다",
      en: "Gin's character comes from juniper and botanicals",
      es: "El carácter del gin viene del enebro y los botánicos",
    },
    summary: {
      ko: "허브·향신료 향이 강해 토닉이나 베르무트와 잘 어울립니다. 도수는 보통 37~47도입니다.",
      en: "Herbal and spice notes pair well with tonic or vermouth. Usually 37-47% ABV.",
      es: "Sus notas herbales y especiadas combinan con tónica o vermut. Suele ser 37-47% ABV.",
    },
    quickFacts: [
      {
        ko: "진토닉은 진 1 : 토닉 3 비율에서 시작해 라임으로 마무리합니다.",
        en: "Start a gin and tonic at 1 part gin to 3 parts tonic, finish with lime.",
        es: "Empieza un gin tonic con 1 de gin por 3 de tónica y termina con lima.",
      },
      {
        ko: "마티니·네그로니처럼 술만 섞는 칵테일은 젓는 것이 정석입니다.",
        en: "Spirit-only drinks like a Martini or Negroni are stirred, not shaken.",
        es: "Los tragos de solo licor como Martini o Negroni se remueven, no se agitan.",
      },
    ],
    relatedRecipeIds: ["gin-and-tonic", "martini", "negroni", "cucumber-gin-fizz"],
    relatedQuizCategory: "cocktails",
    nextStep: {
      label: {
        ko: "진 칵테일 도수 비교하기",
        en: "Compare gin cocktail ABV",
        es: "Comparar ABV de cócteles con gin",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "tequila",
    title: {
      ko: "100% 아가베 데킬라는 다음 날이 한결 가볍습니다",
      en: "100% agave tequila is gentler the next day",
      es: "El tequila 100% agave sienta mejor al día siguiente",
    },
    summary: {
      ko: "용설란으로 만든 멕시코 증류주로 도수는 38~50도. 첨가당이 없는 100% 아가베가 품질의 기준입니다.",
      en: "A Mexican agave spirit at 38-50% ABV. '100% agave' with no added sugar marks quality.",
      es: "Destilado mexicano de agave, 38-50% ABV. '100% agave' sin azúcar marca calidad.",
    },
    quickFacts: [
      {
        ko: "마가리타는 데킬라·트리플섹·라임즙의 균형이 핵심입니다.",
        en: "A margarita balances tequila, triple sec, and lime juice.",
        es: "La margarita equilibra tequila, triple sec y zumo de lima.",
      },
      {
        ko: "단 시럽을 줄이면 칼로리를 낮추면서 산뜻함을 살릴 수 있습니다.",
        en: "Less sweet syrup keeps it lighter and fresher.",
        es: "Menos jarabe la mantiene más ligera y fresca.",
      },
    ],
    relatedRecipeIds: ["margarita", "tequila-sunrise"],
    relatedQuizCategory: "cocktails",
    nextStep: {
      label: {
        ko: "데킬라 퀴즈 풀기",
        en: "Take the tequila quiz",
        es: "Hacer el quiz de tequila",
      },
      target: "/(tabs)/quiz",
    },
  },
  {
    entryId: "sake",
    title: {
      ko: "사케는 온도에 따라 완전히 다른 술이 됩니다",
      en: "Sake changes character with temperature",
      es: "El sake cambia de carácter según la temperatura",
    },
    summary: {
      ko: "쌀로 빚은 일본 양조주로 도수는 14~18도. 고급 사케는 차게, 일반 사케는 데워서 즐기는 경우가 많습니다.",
      en: "A Japanese rice brew at 14-18% ABV. Fine sake is often chilled; everyday sake is sometimes warmed.",
      es: "Fermentado japonés de arroz, 14-18% ABV. El fino se sirve frío; el común a veces tibio.",
    },
    quickFacts: [
      {
        ko: "차게 마시면 섬세한 향이, 데우면 부드러운 단맛이 강조됩니다.",
        en: "Chilled emphasizes delicate aroma; warmed highlights soft sweetness.",
        es: "Frío resalta el aroma; tibio destaca el dulzor suave.",
      },
      {
        ko: "도수는 와인과 비슷하지만 작은 잔으로 여러 번 따르는 점을 기록에 반영하세요.",
        en: "ABV is wine-like, but small repeated pours add up — log them.",
        es: "El ABV es similar al vino, pero los pequeños servicios suman: regístralos.",
      },
    ],
    relatedRecipeIds: ["cheongju-honey"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "사케 기록 남기기",
        en: "Log a sake serving",
        es: "Registrar una porción de sake",
      },
      target: "/(tabs)/tracker",
    },
  },
  {
    entryId: "brandy",
    title: {
      ko: "브랜디는 과일을 증류한 식후주입니다",
      en: "Brandy is a fruit-distilled digestif",
      es: "El brandy es un destilado de fruta digestivo",
    },
    summary: {
      ko: "포도 등 과일을 증류해 만든 35~60도 술로, 식후에 소량 천천히 즐기는 전통이 있습니다.",
      en: "Distilled from grapes or other fruit at 35-60% ABV, traditionally sipped slowly after a meal.",
      es: "Destilado de uva u otra fruta, 35-60% ABV, se bebe despacio tras la comida.",
    },
    quickFacts: [
      {
        ko: "향을 모으도록 볼이 넓은 잔에 소량만 따르는 것이 좋습니다.",
        en: "Pour a small amount in a wide bowl glass to gather the aroma.",
        es: "Sirve poca cantidad en copa ancha para concentrar el aroma.",
      },
      {
        ko: "도수가 높아 적은 양에도 표준잔이 빠르게 쌓입니다.",
        en: "High ABV means standard drinks add up quickly even in small pours.",
        es: "Su alto ABV hace que los tragos estándar suban rápido aun en poca cantidad.",
      },
    ],
    relatedRecipeIds: ["hot-toddy", "old-fashioned"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "증류주 도수 계산하기",
        en: "Check spirit ABV",
        es: "Calcular el ABV del destilado",
      },
      target: "/(tabs)/tracker",
    },
  },
  {
    entryId: "liqueur",
    title: {
      ko: "리큐어는 도수와 당도가 함께 높을 수 있습니다",
      en: "Liqueurs can be high in both ABV and sugar",
      es: "Los licores pueden tener mucho ABV y azúcar",
    },
    summary: {
      ko: "과일·허브·향신료에 설탕을 더한 가향주로 도수 폭이 15~55도로 넓습니다. 칼로리도 높은 편입니다.",
      en: "Sweetened flavored spirits ranging widely from 15-55% ABV, and often calorie-dense.",
      es: "Destilados aromatizados y azucarados, de 15-55% ABV, y suelen ser calóricos.",
    },
    quickFacts: [
      {
        ko: "커피·크림 리큐어는 디저트 칵테일의 단맛과 칼로리를 좌우합니다.",
        en: "Coffee and cream liqueurs drive the sweetness and calories of dessert cocktails.",
        es: "Los licores de café y crema marcan el dulzor y las calorías de los cócteles postre.",
      },
      {
        ko: "소량으로 향을 더하는 보조 재료로 쓰면 균형을 잡기 좋습니다.",
        en: "Used in small amounts as an accent, they balance a drink well.",
        es: "En pequeñas dosis como acento, equilibran bien el trago.",
      },
    ],
    relatedRecipeIds: ["espresso-martini", "kahlua-milk", "amaretto-sour", "fuzzy-navel"],
    relatedQuizCategory: "cocktails",
    nextStep: {
      label: {
        ko: "리큐어 칵테일 보기",
        en: "Open liqueur cocktails",
        es: "Ver cócteles con licor",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "champagne",
    title: {
      ko: "샴페인은 프랑스 샴페인 지역의 스파클링입니다",
      en: "Champagne is sparkling wine from the Champagne region",
      es: "El champán es espumoso de la región de Champagne",
    },
    summary: {
      ko: "병 내 2차 발효로 기포를 만든 11~13도 와인입니다. 다른 지역 스파클링과는 명칭이 구분됩니다.",
      en: "An 11-13% ABV wine with bubbles from a second fermentation in the bottle, distinct from other sparkling wines by name.",
      es: "Vino de 11-13% ABV con burbujas de segunda fermentación en botella, distinto por nombre de otros espumosos.",
    },
    quickFacts: [
      {
        ko: "차게 6~10도로 서빙하면 기포가 섬세하게 유지됩니다.",
        en: "Serve cold at 6-10°C to keep the bubbles fine.",
        es: "Sirve frío a 6-10°C para mantener las burbujas finas.",
      },
      {
        ko: "스파클링은 빨리 취하기 쉬우니 물과 번갈아 마시세요.",
        en: "Sparkling can hit fast, so alternate with water.",
        es: "El espumoso sube rápido; alterna con agua.",
      },
    ],
    relatedRecipeIds: ["aperol-spritz"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "스파클링 상식 퀴즈",
        en: "Sparkling knowledge quiz",
        es: "Quiz de espumosos",
      },
      target: "/(tabs)/quiz",
    },
  },
  {
    entryId: "cheongju",
    title: {
      ko: "청주는 맑게 거른 한국 전통 약주입니다",
      en: "Cheongju is a clear, refined Korean rice wine",
      es: "El cheongju es un vino de arroz coreano claro",
    },
    summary: {
      ko: "쌀로 빚어 맑게 거른 13~18도 술로 제례와 차례에 쓰이며, 차게도 데워서도 즐깁니다.",
      en: "A clear 13-18% ABV rice wine used in ceremonies, served chilled or warm.",
      es: "Vino de arroz claro de 13-18% ABV usado en ceremonias, frío o tibio.",
    },
    quickFacts: [
      {
        ko: "맑게 거르면 청주, 거르지 않아 탁하면 탁주(막걸리)입니다.",
        en: "Filtered clear is cheongju; left cloudy it becomes takju (makgeolli).",
        es: "Filtrado claro es cheongju; turbio es takju (makgeolli).",
      },
      {
        ko: "전이나 생선구이 같은 담백한 안주와 잘 어울립니다.",
        en: "It pairs well with mild dishes like jeon or grilled fish.",
        es: "Combina con platos suaves como jeon o pescado a la parrilla.",
      },
    ],
    relatedRecipeIds: ["cheongju-honey"],
    relatedQuizCategory: "korean",
    nextStep: {
      label: {
        ko: "전통주 퀴즈 풀기",
        en: "Take the traditional drinks quiz",
        es: "Hacer el quiz de bebidas tradicionales",
      },
      target: "/(tabs)/quiz",
    },
  },
  {
    entryId: "bokbunja",
    title: {
      ko: "복분자주는 산딸기로 빚은 달콤한 과실주입니다",
      en: "Bokbunja wine is a sweet Korean berry wine",
      es: "El bokbunja es un vino dulce de frambuesa coreana",
    },
    summary: {
      ko: "한국산 산딸기(복분자)로 담근 14~19도 과실주로, 색이 짙고 단맛이 있어 차게 즐깁니다.",
      en: "A 14-19% ABV fruit wine from Korean black raspberries — deep-colored, sweet, served chilled.",
      es: "Vino de frutas de 14-19% ABV de frambuesa negra coreana, de color intenso, dulce y frío.",
    },
    quickFacts: [
      {
        ko: "당도가 높아 디저트나 치즈와 잘 어울립니다.",
        en: "Its sweetness pairs nicely with dessert or cheese.",
        es: "Su dulzor combina bien con postre o queso.",
      },
      {
        ko: "탄산수와 섞으면 가벼운 스파클링 음료처럼 즐길 수 있습니다.",
        en: "Mixed with soda it drinks like a light sparkler.",
        es: "Con soda se bebe como un espumoso ligero.",
      },
    ],
    relatedRecipeIds: ["bokbunja-cocktail"],
    relatedQuizCategory: "korean",
    nextStep: {
      label: {
        ko: "과실주 레시피 보기",
        en: "Open fruit-wine recipes",
        es: "Ver recetas de vino de frutas",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "baijiu",
    title: {
      ko: "백주(바이주)는 향이 강한 중국 고도수 증류주입니다",
      en: "Baijiu is a strong, aromatic Chinese spirit",
      es: "El baijiu es un destilado chino fuerte y aromático",
    },
    summary: {
      ko: "수수 등 곡물로 증류한 35~60도 술로 향이 강렬합니다. 작은 잔으로 소량씩 천천히 마십니다.",
      en: "Distilled from sorghum and grains at 35-60% ABV with bold aroma, sipped slowly in small cups.",
      es: "Destilado de sorgo y granos, 35-60% ABV, de aroma intenso, se bebe despacio en copas pequeñas.",
    },
    quickFacts: [
      {
        ko: "도수가 매우 높아 적은 양에도 표준잔이 빠르게 늘어납니다.",
        en: "Very high ABV means standard drinks climb fast even in small pours.",
        es: "Su ABV muy alto hace que los tragos estándar suban rápido.",
      },
      {
        ko: "기름진 중식 요리와 곁들이면 강한 향이 한결 부드럽게 느껴집니다.",
        en: "Rich Chinese dishes soften its intense aroma.",
        es: "Los platos chinos grasos suavizan su aroma intenso.",
      },
    ],
    relatedRecipeIds: ["old-fashioned", "rusty-nail"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "고도수 술 도수 계산하기",
        en: "Check high-proof ABV",
        es: "Calcular ABV de alta graduación",
      },
      target: "/(tabs)/tracker",
    },
  },
  {
    entryId: "absinthe",
    title: {
      ko: "압생트는 반드시 희석해 마시는 고도수 리큐어입니다",
      en: "Absinthe is a high-proof liqueur served diluted",
      es: "La absenta es un licor fuerte que se sirve diluido",
    },
    summary: {
      ko: "약쑥·허브로 만든 45~74도 술로, 찬물에 천천히 희석해 향을 풀어 마시는 것이 전통입니다.",
      en: "A 45-74% ABV herbal spirit with wormwood, traditionally diluted slowly with iced water.",
      es: "Destilado herbal de 45-74% ABV con ajenjo, se diluye despacio con agua helada.",
    },
    quickFacts: [
      {
        ko: "스트레이트로 마시기엔 도수가 매우 높아 위험할 수 있습니다.",
        en: "It is far too strong to drink neat.",
        es: "Es demasiado fuerte para beber sola.",
      },
      {
        ko: "찬물을 한 방울씩 더하면 향 성분이 퍼지며 흐려집니다.",
        en: "Adding iced water drop by drop releases the aromatics and clouds the drink.",
        es: "Añadir agua helada gota a gota libera los aromas y la enturbia.",
      },
    ],
    relatedRecipeIds: ["old-fashioned"],
    relatedQuizCategory: "safety",
    nextStep: {
      label: {
        ko: "안전 음주 퀴즈 풀기",
        en: "Take the safety quiz",
        es: "Hacer el quiz de seguridad",
      },
      target: "/(tabs)/quiz",
    },
  },
  {
    entryId: "cognac",
    title: {
      ko: "코냑은 엄격한 기준으로 만든 프랑스 브랜디입니다",
      en: "Cognac is a strictly regulated French brandy",
      es: "El coñac es un brandy francés muy regulado",
    },
    summary: {
      ko: "프랑스 코냑 지역의 포도를 두 번 증류해 숙성한 40~43도 브랜디로, 식후에 소량 즐깁니다.",
      en: "A 40-43% ABV brandy double-distilled and aged from grapes in the Cognac region, sipped after meals.",
      es: "Brandy de 40-43% ABV, doble destilado y añejado, de uvas de Cognac, se bebe tras comer.",
    },
    quickFacts: [
      {
        ko: "VS·VSOP·XO는 숙성 기간에 따른 등급 표기입니다.",
        en: "VS, VSOP, and XO mark the aging grade.",
        es: "VS, VSOP y XO indican el grado de añejamiento.",
      },
      {
        ko: "초콜릿·디저트와 곁들이면 풍미가 서로 살아납니다.",
        en: "It complements chocolate and dessert nicely.",
        es: "Complementa bien el chocolate y los postres.",
      },
    ],
    relatedRecipeIds: ["old-fashioned", "rusty-nail"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "브랜디 레시피 비교하기",
        en: "Compare brandy recipes",
        es: "Comparar recetas con brandy",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "mezcal",
    title: {
      ko: "메스칼은 스모키한 향의 아가베 증류주입니다",
      en: "Mezcal is a smoky agave spirit",
      es: "El mezcal es un destilado de agave ahumado",
    },
    summary: {
      ko: "용설란을 구워 훈제 향을 입힌 멕시코 증류주로 도수는 38~55도. 데킬라의 사촌 격입니다.",
      en: "A Mexican agave spirit at 38-55% ABV with a roasted, smoky aroma — tequila's cousin.",
      es: "Destilado mexicano de agave, 38-55% ABV, de aroma ahumado: primo del tequila.",
    },
    quickFacts: [
      {
        ko: "오렌지와 소금을 곁들여 스트레이트로 즐기는 전통이 있습니다.",
        en: "Traditionally sipped neat with orange and salt.",
        es: "Tradicionalmente se bebe solo con naranja y sal.",
      },
      {
        ko: "스모키한 향이 강해 칵테일에 소량만 써도 개성이 살아납니다.",
        en: "Its smoke is bold, so a small amount flavors a cocktail.",
        es: "Su humo es intenso; poca cantidad ya da carácter al cóctel.",
      },
    ],
    relatedRecipeIds: ["margarita", "tequila-sunrise"],
    relatedQuizCategory: "cocktails",
    nextStep: {
      label: {
        ko: "아가베 술 퀴즈 풀기",
        en: "Take the agave-spirit quiz",
        es: "Hacer el quiz de destilados de agave",
      },
      target: "/(tabs)/quiz",
    },
  },
  {
    entryId: "port",
    title: {
      ko: "포트와인은 발효 중 브랜디를 더한 주정강화 와인입니다",
      en: "Port is a fortified wine with brandy added mid-fermentation",
      es: "El Oporto es un vino fortificado con brandy",
    },
    summary: {
      ko: "발효 도중 브랜디를 넣어 단맛과 도수를 함께 높인 19~22도 포르투갈 와인입니다.",
      en: "A 19-22% ABV Portuguese wine made sweeter and stronger by adding brandy during fermentation.",
      es: "Vino portugués de 19-22% ABV, más dulce y fuerte por añadir brandy en la fermentación.",
    },
    quickFacts: [
      {
        ko: "당도와 도수가 모두 높아 소량의 디저트 와인으로 즐깁니다.",
        en: "High in both sugar and ABV, it's enjoyed in small dessert pours.",
        es: "Alto en azúcar y ABV, se disfruta en pequeñas porciones de postre.",
      },
      {
        ko: "블루치즈·초콜릿과의 페어링이 고전적입니다.",
        en: "Classic pairings include blue cheese and chocolate.",
        es: "Maridajes clásicos: queso azul y chocolate.",
      },
    ],
    relatedRecipeIds: ["kalimotxo"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "주정강화 와인 기록하기",
        en: "Log a fortified wine",
        es: "Registrar un vino fortificado",
      },
      target: "/(tabs)/tracker",
    },
  },
  {
    entryId: "vermouth",
    title: {
      ko: "베르무트는 칵테일의 뼈대를 잡는 가향 와인입니다",
      en: "Vermouth is an aromatized wine that anchors cocktails",
      es: "El vermut es un vino aromatizado que sostiene cócteles",
    },
    summary: {
      ko: "허브로 풍미를 더한 15~18도 주정강화 와인으로, 마티니·네그로니·맨해튼의 핵심 재료입니다.",
      en: "A 15-18% ABV fortified wine flavored with herbs — key to Martini, Negroni, and Manhattan.",
      es: "Vino fortificado de 15-18% ABV con hierbas, clave en Martini, Negroni y Manhattan.",
    },
    quickFacts: [
      {
        ko: "와인 기반이라 개봉 후 냉장 보관하고 몇 주 안에 쓰는 것이 좋습니다.",
        en: "Being wine-based, refrigerate after opening and use within weeks.",
        es: "Al ser a base de vino, refrigéralo tras abrir y úsalo en semanas.",
      },
      {
        ko: "드라이 베르무트는 마티니에, 스위트 베르무트는 네그로니에 쓰입니다.",
        en: "Dry vermouth suits a Martini; sweet vermouth suits a Negroni.",
        es: "El vermut seco va en Martini; el dulce en Negroni.",
      },
    ],
    relatedRecipeIds: ["martini", "negroni", "manhattan"],
    relatedQuizCategory: "cocktails",
    nextStep: {
      label: {
        ko: "베르무트 칵테일 보기",
        en: "Open vermouth cocktails",
        es: "Ver cócteles con vermut",
      },
      target: "/(tabs)/explore?section=recipes",
    },
  },
  {
    entryId: "soju-fruit",
    title: {
      ko: "과일 소주는 도수가 낮아 입문용으로 좋습니다",
      en: "Flavored soju is lower in ABV and beginner-friendly",
      es: "El soju saborizado es de menor ABV y para principiantes",
    },
    summary: {
      ko: "자몽·복숭아 등 과일 향을 더한 12~14도 소주로 일반 소주보다 부드럽지만, 달아서 더 마시기 쉽습니다.",
      en: "A 12-14% ABV soju with fruit flavors like grapefruit or peach — smoother, but easy to overdrink.",
      es: "Soju de 12-14% ABV con sabores de fruta, más suave pero fácil de beber de más.",
    },
    quickFacts: [
      {
        ko: "도수가 낮다고 방심하면 총량이 빠르게 늘 수 있습니다.",
        en: "Lower ABV can be deceptive — total volume adds up fast.",
        es: "El menor ABV engaña: el volumen total sube rápido.",
      },
      {
        ko: "탄산수·토닉과 섞으면 더 가볍게 즐길 수 있습니다.",
        en: "Mixing with soda or tonic makes it even lighter.",
        es: "Mezclar con soda o tónica lo hace aún más ligero.",
      },
    ],
    relatedRecipeIds: ["green-grape-soju-ade", "soju-tonic-lime", "fuzzy-navel"],
    relatedQuizCategory: "korean",
    nextStep: {
      label: {
        ko: "소주 기록 남기기",
        en: "Log a soju serving",
        es: "Registrar una porción de soju",
      },
      target: "/(tabs)/tracker",
    },
  },
  {
    entryId: "stout",
    title: {
      ko: "스타우트는 구운 보리로 만든 진한 흑맥주입니다",
      en: "Stout is a dark beer made with roasted barley",
      es: "La stout es una cerveza oscura de cebada tostada",
    },
    summary: {
      ko: "구운 맥아의 쌉쌀하고 크리미한 풍미가 특징인 4~9도 맥주로, 도수 폭이 넓습니다.",
      en: "A 4-9% ABV beer with roasted-malt bitterness and a creamy body, spanning a wide ABV range.",
      es: "Cerveza de 4-9% ABV con amargor de malta tostada y cuerpo cremoso, de ABV variable.",
    },
    quickFacts: [
      {
        ko: "임페리얼 스타우트처럼 도수가 높은 종류는 표준잔 환산을 꼭 확인하세요.",
        en: "High-ABV styles like imperial stout deserve a standard-drink check.",
        es: "Estilos fuertes como la imperial stout requieren revisar el trago estándar.",
      },
      {
        ko: "굴·스테이크·초콜릿과의 페어링이 잘 알려져 있습니다.",
        en: "It pairs famously with oysters, steak, and chocolate.",
        es: "Marida muy bien con ostras, filete y chocolate.",
      },
    ],
    relatedRecipeIds: ["poktanju", "somaek"],
    relatedQuizCategory: "basics",
    nextStep: {
      label: {
        ko: "맥주 칼로리 계산하기",
        en: "Estimate beer calories",
        es: "Calcular calorías de la cerveza",
      },
      target: "/(tabs)/tracker",
    },
  },
];
