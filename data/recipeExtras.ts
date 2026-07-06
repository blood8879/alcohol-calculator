import { LocalizedText } from "../utils/localizedText";

/**
 * Optional enrichment for recipe detail views: origin/story, serving tips, and
 * garnish. Keyed by recipe id so it covers both the keyed cocktailRecipes set
 * and the inline extendedContent set without touching either data file.
 * Recipes without an entry simply render the base detail. Not medical advice.
 */
export type RecipeExtra = {
  readonly origin?: LocalizedText;
  readonly garnish?: LocalizedText;
  readonly tips?: readonly LocalizedText[];
};

export const recipeExtras: Record<string, RecipeExtra> = {
  somaek: {
    origin: {
      ko: "한국 회식 문화에서 자리 잡은 소주와 맥주의 조합으로, 부드럽게 넘어가 빠르게 분위기를 띄웁니다.",
      en: "A soju-and-beer mix rooted in Korean group dining that goes down smoothly and lifts the mood fast.",
      es: "Una mezcla de soju y cerveza típica de las cenas coreanas, suave y animada.",
    },
    garnish: { ko: "없음 (잔째로)", en: "None (serve in the glass)", es: "Ninguna" },
    tips: [
      {
        ko: "맥주를 먼저 따르고 소주를 더한 뒤 가볍게 한 번만 저어야 탄산이 살아 있습니다.",
        en: "Pour beer first, add soju, then stir just once to keep the carbonation.",
        es: "Sirve primero la cerveza, añade soju y remueve solo una vez para conservar el gas.",
      },
      {
        ko: "부드럽게 넘어가도 총 알코올량은 그대로이니 잔 수를 기록하세요.",
        en: "It drinks easy, but the total alcohol is unchanged — log your glasses.",
        es: "Entra fácil, pero el alcohol total es el mismo: registra tus vasos.",
      },
    ],
  },
  poktanju: {
    origin: {
      ko: "맥주잔에 소주잔을 떨어뜨려 만드는 폭탄주로, 빠른 취기 때문에 양 조절이 중요합니다.",
      en: "A 'bomb' shot dropped into beer — its fast kick makes pacing important.",
      es: "Un 'bomba' que cae en la cerveza; su efecto rápido exige moderación.",
    },
    tips: [
      {
        ko: "도수가 빠르게 올라가니 물과 번갈아 마시며 천천히 즐기세요.",
        en: "It hits quickly — alternate with water and go slow.",
        es: "Sube rápido: alterna con agua y ve despacio.",
      },
    ],
  },
  "maesil-highball": {
    origin: {
      ko: "새콤달콤한 매실주를 탄산으로 길게 늘여 산뜻하게 즐기는 하이볼입니다.",
      en: "A highball that stretches sweet-tart plum liqueur with soda for a crisp drink.",
      es: "Un highball que alarga el licor de ciruela con soda para un trago fresco.",
    },
    garnish: { ko: "레몬 슬라이스", en: "Lemon slice", es: "Rodaja de limón" },
    tips: [
      {
        ko: "얼음을 가득 채우면 끝까지 시원하고 묽어지지 않습니다.",
        en: "Fill with ice to stay cold and avoid over-dilution.",
        es: "Llena de hielo para mantenerlo frío sin diluir de más.",
      },
    ],
  },
  "yuza-sour": {
    origin: {
      ko: "유자청의 향긋함을 살린 한국식 사워로, 겨울철 인기가 높습니다.",
      en: "A Korean-style sour built on fragrant yuzu syrup, popular in winter.",
      es: "Un sour de estilo coreano con sirope de yuzu, popular en invierno.",
    },
    garnish: { ko: "유자 껍질", en: "Yuzu peel", es: "Piel de yuzu" },
    tips: [
      {
        ko: "유자청 단맛이 강하면 레몬즙을 조금 더해 균형을 잡으세요.",
        en: "If the yuzu syrup is very sweet, add a touch more lemon to balance.",
        es: "Si el sirope es muy dulce, añade un poco más de limón.",
      },
    ],
  },
  margarita: {
    origin: {
      ko: "1930~40년대 멕시코·미국 국경 지역에서 유래했다고 전해지는 대표적인 데킬라 칵테일입니다.",
      en: "A classic tequila cocktail said to have emerged around the Mexico–US border in the 1930s–40s.",
      es: "Un cóctel clásico de tequila surgido en la frontera México–EE. UU. en los años 30–40.",
    },
    garnish: { ko: "소금 리밍, 라임 웨지", en: "Salt rim, lime wedge", es: "Borde de sal, gajo de lima" },
    tips: [
      {
        ko: "잔 가장자리에만 소금을 묻히면 한 모금마다 짠맛을 조절할 수 있습니다.",
        en: "Salt only half the rim so you can control the saltiness sip by sip.",
        es: "Pon sal en medio borde para controlar el salado en cada sorbo.",
      },
      {
        ko: "신선한 라임즙을 쓰면 시판 믹스보다 훨씬 산뜻합니다.",
        en: "Fresh lime juice tastes far brighter than bottled mix.",
        es: "El zumo de lima fresco sabe mucho mejor que la mezcla embotellada.",
      },
    ],
  },
  mojito: {
    origin: {
      ko: "쿠바 아바나에서 태어난 럼 베이스 칵테일로, 민트와 라임의 청량감이 특징입니다.",
      en: "A rum cocktail born in Havana, Cuba, defined by fresh mint and lime.",
      es: "Un cóctel de ron nacido en La Habana, con menta y lima frescas.",
    },
    garnish: { ko: "민트 잎, 라임", en: "Mint sprig, lime", es: "Ramita de menta, lima" },
    tips: [
      {
        ko: "민트는 으깨지 말고 가볍게 눌러 향만 내야 쓴맛이 안 납니다.",
        en: "Press mint gently to release aroma — crushing it turns it bitter.",
        es: "Presiona la menta con suavidad; machacarla la amarga.",
      },
    ],
  },
  "old-fashioned": {
    origin: {
      ko: "19세기부터 이어진 가장 오래된 칵테일 중 하나로, '칵테일'의 원형으로 불립니다.",
      en: "One of the oldest cocktails, dating to the 19th century and seen as the original template.",
      es: "Uno de los cócteles más antiguos, del siglo XIX, visto como la receta original.",
    },
    garnish: { ko: "오렌지 필, 마라스키노 체리", en: "Orange peel, maraschino cherry", es: "Piel de naranja, cereza" },
    tips: [
      {
        ko: "오렌지 필을 비틀어 오일을 뿌리면 향이 한층 깊어집니다.",
        en: "Twist the orange peel over the glass to spray aromatic oils.",
        es: "Retuerce la piel de naranja sobre el vaso para liberar aceites.",
      },
      {
        ko: "큰 얼음 한 덩이를 쓰면 천천히 녹아 풍미가 오래 유지됩니다.",
        en: "Use one large ice cube so it melts slowly and keeps flavor intact.",
        es: "Usa un cubo de hielo grande para que se derrita lento.",
      },
    ],
  },
  martini: {
    origin: {
      ko: "진과 드라이 베르무트로 만드는 클래식의 상징으로, 비율과 가니시로 개성을 표현합니다.",
      en: "The icon of classic cocktails — gin and dry vermouth, personalized by ratio and garnish.",
      es: "El ícono de los clásicos: gin y vermut seco, personalizado por proporción y decoración.",
    },
    garnish: { ko: "올리브 또는 레몬 트위스트", en: "Olive or lemon twist", es: "Aceituna o twist de limón" },
    tips: [
      {
        ko: "잔을 미리 차갑게 해두면 마지막 한 모금까지 시원합니다.",
        en: "Chill the glass beforehand to keep it cold to the last sip.",
        es: "Enfría la copa antes para mantenerla fría hasta el final.",
      },
      {
        ko: "젓기(stir)가 정석 — 셰이크하면 탁해지고 묽어집니다.",
        en: "Stir, don't shake — shaking clouds and over-dilutes it.",
        es: "Remueve, no agites: agitar la enturbia y diluye.",
      },
    ],
  },
  negroni: {
    origin: {
      ko: "이탈리아 피렌체에서 탄생했다고 전해지는, 진·캄파리·스위트 베르무트 1:1:1의 쌉쌀한 클래식입니다.",
      en: "A bitter Italian classic from Florence — equal parts gin, Campari, and sweet vermouth.",
      es: "Un clásico amargo de Florencia: gin, Campari y vermut dulce a partes iguales.",
    },
    garnish: { ko: "오렌지 슬라이스", en: "Orange slice", es: "Rodaja de naranja" },
    tips: [
      {
        ko: "쌉쌀함이 강하니 처음이라면 탄산수를 약간 더해 가볍게 시작하세요.",
        en: "It's quite bitter — first-timers can add a splash of soda to lighten it.",
        es: "Es muy amargo; los novatos pueden añadir un chorrito de soda.",
      },
    ],
  },
  daiquiri: {
    origin: {
      ko: "쿠바 광산 마을 다이키리에서 이름을 딴, 럼·라임·설탕의 단순하고 균형 잡힌 칵테일입니다.",
      en: "Named after a Cuban mining town — a simple, balanced mix of rum, lime, and sugar.",
      es: "Nombrado por un pueblo minero cubano: ron, lima y azúcar en equilibrio.",
    },
    garnish: { ko: "라임 휠", en: "Lime wheel", es: "Rueda de lima" },
    tips: [
      {
        ko: "갓 짠 라임즙과 심플 시럽 비율을 맞추면 산뜻함이 살아납니다.",
        en: "Balance fresh lime with simple syrup for a crisp finish.",
        es: "Equilibra lima fresca con jarabe para un final fresco.",
      },
    ],
  },
  manhattan: {
    origin: {
      ko: "19세기 뉴욕에서 유래한 위스키 칵테일로, 라이 위스키와 스위트 베르무트의 조화가 핵심입니다.",
      en: "A 19th-century New York whiskey cocktail balancing rye and sweet vermouth.",
      es: "Un cóctel de whisky neoyorquino del siglo XIX: rye y vermut dulce.",
    },
    garnish: { ko: "마라스키노 체리", en: "Maraschino cherry", es: "Cereza al marrasquino" },
    tips: [
      {
        ko: "얼음과 충분히 저어 차갑게 한 뒤 칵테일 잔에 걸러 따르세요.",
        en: "Stir well with ice to chill, then strain into a coupe.",
        es: "Remueve bien con hielo y cuela en copa.",
      },
    ],
  },
  cosmopolitan: {
    origin: {
      ko: "1990년대 대중문화와 함께 유행한 보드카 베이스 칵테일로, 산뜻한 크랜베리 색이 특징입니다.",
      en: "A vodka cocktail popularized by 1990s pop culture, known for its crisp cranberry hue.",
      es: "Un cóctel de vodka popularizado en los 90, con su color a arándano.",
    },
    garnish: { ko: "라임 휠 또는 오렌지 필", en: "Lime wheel or orange peel", es: "Rueda de lima o piel de naranja" },
    tips: [
      {
        ko: "크랜베리 주스 양으로 단맛과 색을 조절할 수 있습니다.",
        en: "Adjust cranberry juice to tune sweetness and color.",
        es: "Ajusta el zumo de arándano para el dulzor y el color.",
      },
    ],
  },
  "gin-and-tonic": {
    origin: {
      ko: "열대 지역 말라리아 예방용 토닉에서 출발한, 가장 대중적인 진 하이볼입니다.",
      en: "The most popular gin highball, originating from quinine tonic used against malaria.",
      es: "El gin highball más popular, surgido de la tónica de quinina contra la malaria.",
    },
    garnish: { ko: "라임 웨지 또는 로즈마리", en: "Lime wedge or rosemary", es: "Gajo de lima o romero" },
    tips: [
      {
        ko: "진 1 : 토닉 3에서 시작해 입맛에 맞게 조절하세요.",
        en: "Start at 1 part gin to 3 parts tonic and adjust to taste.",
        es: "Empieza con 1 de gin por 3 de tónica y ajusta.",
      },
    ],
  },
  "pina-colada": {
    origin: {
      ko: "푸에르토리코를 대표하는 트로피컬 칵테일로, 럼·코코넛·파인애플의 달콤함이 특징입니다.",
      en: "Puerto Rico's signature tropical cocktail — rum, coconut, and sweet pineapple.",
      es: "El cóctel tropical de Puerto Rico: ron, coco y piña dulce.",
    },
    garnish: { ko: "파인애플 조각, 체리", en: "Pineapple wedge, cherry", es: "Trozo de piña, cereza" },
    tips: [
      {
        ko: "코코넛 크림과 주스 때문에 칼로리가 높으니 양을 염두에 두세요.",
        en: "Coconut cream and juice make it calorie-dense — keep portions in mind.",
        es: "La crema de coco y el zumo la hacen calórica: cuida las porciones.",
      },
    ],
  },
  "long-island-iced-tea": {
    origin: {
      ko: "다섯 가지 술이 들어가는 강한 칵테일로, 콜라 색과 달리 도수가 매우 높습니다.",
      en: "A strong cocktail with five spirits — its cola color hides a very high ABV.",
      es: "Un cóctel fuerte con cinco licores; su color a cola esconde un ABV alto.",
    },
    garnish: { ko: "레몬 웨지", en: "Lemon wedge", es: "Gajo de limón" },
    tips: [
      {
        ko: "도수가 매우 높습니다. 한 잔으로도 표준잔 여러 개에 해당하니 주의하세요.",
        en: "Very high ABV — a single glass equals several standard drinks. Be careful.",
        es: "ABV muy alto: un vaso equivale a varios tragos estándar. Cuidado.",
      },
    ],
  },
  "whiskey-sour": {
    origin: {
      ko: "위스키에 레몬과 시럽을 더한 사워 계열의 클래식으로, 달걀 흰자로 부드러운 거품을 냅니다.",
      en: "A classic sour of whiskey, lemon, and syrup, often given a silky foam with egg white.",
      es: "Un sour clásico de whisky, limón y jarabe, con espuma de clara de huevo.",
    },
    garnish: { ko: "레몬 슬라이스, 체리", en: "Lemon slice, cherry", es: "Rodaja de limón, cereza" },
    tips: [
      {
        ko: "달걀 흰자를 넣을 때는 얼음 없이 먼저 흔든 뒤(드라이 셰이크) 얼음과 다시 흔듭니다.",
        en: "For egg white, dry-shake without ice first, then shake again with ice.",
        es: "Con clara, agita primero sin hielo y luego con hielo.",
      },
    ],
  },
  "bloody-mary": {
    origin: {
      ko: "토마토 주스와 향신료가 들어가는 해장용으로도 즐기는 보드카 칵테일입니다.",
      en: "A savory vodka cocktail with tomato juice and spices, also enjoyed as a brunch reviver.",
      es: "Un cóctel salado de vodka con zumo de tomate y especias, típico del brunch.",
    },
    garnish: { ko: "셀러리, 레몬", en: "Celery stick, lemon", es: "Apio, limón" },
    tips: [
      {
        ko: "타바스코와 우스터소스 양으로 매운맛과 감칠맛을 조절하세요.",
        en: "Tune heat and umami with Tabasco and Worcestershire sauce.",
        es: "Ajusta el picante y el umami con Tabasco y salsa Worcestershire.",
      },
    ],
  },
  "aperol-spritz": {
    origin: {
      ko: "이탈리아 베네토 지역에서 시작된 가벼운 식전주로, 낮은 도수와 산뜻함이 특징입니다.",
      en: "A light aperitif from Italy's Veneto region, known for low ABV and a crisp finish.",
      es: "Un aperitivo ligero del Véneto italiano, de bajo ABV y final fresco.",
    },
    garnish: { ko: "오렌지 슬라이스", en: "Orange slice", es: "Rodaja de naranja" },
    tips: [
      {
        ko: "프로세코 3 : 아페롤 2 : 소다 1 비율이 정석입니다.",
        en: "The classic ratio is 3 prosecco : 2 Aperol : 1 soda.",
        es: "La proporción clásica es 3 prosecco : 2 Aperol : 1 soda.",
      },
    ],
  },
  "espresso-martini": {
    origin: {
      ko: "1980년대 런던에서 만들어진 커피 칵테일로, 잠을 깨우면서 취하게 한다는 농담에서 탄생했습니다.",
      en: "A coffee cocktail created in 1980s London, born from a request to 'wake me up, then mess me up'.",
      es: "Un cóctel de café creado en Londres en los 80, para 'despertar y animar'.",
    },
    garnish: { ko: "커피 원두 3알", en: "Three coffee beans", es: "Tres granos de café" },
    tips: [
      {
        ko: "갓 내린 에스프레소를 식혀 쓰면 거품(크레마)이 더 예쁘게 올라옵니다.",
        en: "Use freshly pulled, cooled espresso for a prettier crema on top.",
        es: "Usa espresso recién hecho y frío para una mejor crema.",
      },
    ],
  },
  "moscow-mule": {
    origin: {
      ko: "1940년대 미국에서 보드카 판매를 늘리기 위해 만들어진, 구리잔에 내는 칵테일입니다.",
      en: "A 1940s American creation to boost vodka sales, traditionally served in a copper mug.",
      es: "Una creación estadounidense de los 40 para impulsar el vodka, servida en taza de cobre.",
    },
    garnish: { ko: "라임 웨지, 민트", en: "Lime wedge, mint", es: "Gajo de lima, menta" },
    tips: [
      {
        ko: "구리잔은 차가움을 오래 유지해 청량감을 더해줍니다.",
        en: "A copper mug holds the cold longer for extra refreshment.",
        es: "La taza de cobre mantiene el frío más tiempo.",
      },
    ],
  },
  "tequila-sunrise": {
    origin: {
      ko: "오렌지 주스 위로 그레나딘이 가라앉아 일출 같은 그라데이션을 만드는 칵테일입니다.",
      en: "Grenadine sinks through orange juice to create a sunrise-like gradient.",
      es: "La granadina se hunde en el zumo de naranja creando un degradado de amanecer.",
    },
    garnish: { ko: "오렌지 슬라이스, 체리", en: "Orange slice, cherry", es: "Rodaja de naranja, cereza" },
    tips: [
      {
        ko: "그레나딘은 마지막에 천천히 부어야 층이 선명하게 나뉩니다.",
        en: "Pour grenadine slowly at the end for a clean layered look.",
        es: "Vierte la granadina al final y despacio para capas limpias.",
      },
    ],
  },
  caipirinha: {
    origin: {
      ko: "브라질의 국민 칵테일로, 사탕수수 술 카샤사에 라임과 설탕을 으깨 만듭니다.",
      en: "Brazil's national cocktail, made by muddling lime and sugar with cachaça.",
      es: "El cóctel nacional de Brasil: lima y azúcar machacados con cachaça.",
    },
    garnish: { ko: "라임 조각", en: "Lime wedges", es: "Gajos de lima" },
    tips: [
      {
        ko: "라임은 껍질의 쓴맛이 우러나지 않도록 가볍게 으깨세요.",
        en: "Muddle the lime gently so the peel doesn't turn it bitter.",
        es: "Machaca la lima con suavidad para que la piel no amargue.",
      },
    ],
  },
  "amaretto-sour": {
    origin: {
      ko: "아몬드 향의 아마레또 리큐어에 레몬을 더한 달콤쌉싸름한 사워입니다.",
      en: "A sweet-tart sour built on almond-scented amaretto and lemon.",
      es: "Un sour dulce y ácido con amaretto de almendra y limón.",
    },
    garnish: { ko: "레몬 슬라이스, 체리", en: "Lemon slice, cherry", es: "Rodaja de limón, cereza" },
    tips: [
      {
        ko: "달걀 흰자를 더하면 부드러운 거품과 균형 잡힌 맛이 납니다.",
        en: "Adding egg white gives a silky foam and rounder taste.",
        es: "Añadir clara de huevo da espuma sedosa y sabor redondo.",
      },
    ],
  },
  "kahlua-milk": {
    origin: {
      ko: "커피 리큐어 깔루아에 우유를 더한 부드럽고 달콤한 디저트 칵테일입니다.",
      en: "A smooth, sweet dessert cocktail of Kahlúa coffee liqueur and milk.",
      es: "Un cóctel postre suave y dulce de licor de café Kahlúa y leche.",
    },
    garnish: { ko: "없음", en: "None", es: "Ninguna" },
    tips: [
      {
        ko: "얼음 위로 깔루아를 먼저, 우유를 천천히 부으면 층이 예쁘게 생깁니다.",
        en: "Pour Kahlúa over ice first, then milk slowly for a layered look.",
        es: "Vierte Kahlúa sobre hielo y luego leche despacio para capas.",
      },
    ],
  },
};

export const getRecipeExtra = (id: string): RecipeExtra | undefined =>
  recipeExtras[id];
