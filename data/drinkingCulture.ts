import { LocalizedText } from "../utils/localizedText";

export type DrinkingCulture = {
  id: string;
  emoji: string;
  country: LocalizedText;
  customs: readonly LocalizedText[];
  etiquette: readonly LocalizedText[];
};

export const drinkingCultures: readonly DrinkingCulture[] = [
  {
    id: "korea",
    emoji: "🇰🇷",
    country: { ko: "한국", en: "South Korea", es: "Corea del Sur" },
    customs: [
      {
        ko: "소맥(소주+맥주)·폭탄주 문화가 발달해 있으며, 회식 자리에서 여럿이 함께 즐기는 음주 문화가 강하다.",
        en: "Mixing soju with beer ('somaek') is a popular tradition, and group drinking at work dinners is deeply ingrained.",
        es: "Mezclar soju con cerveza ('somaek') es una tradición popular, y beber en grupo en cenas de trabajo está profundamente arraigado.",
      },
      {
        ko: "삼겹살·치킨 등 안주 문화가 발달해 술과 음식을 함께 즐기는 것이 일반적이다.",
        en: "A rich culture of 'anju' (drinking snacks) has developed; enjoying food alongside drinks is the norm.",
        es: "Se ha desarrollado una rica cultura de 'anju' (aperitivos para beber); disfrutar la comida junto con las bebidas es la norma.",
      },
      {
        ko: "2차·3차로 이어지는 여러 단계 음주 문화가 있어 노래방이나 다른 장소로 자리를 옮기는 것이 흔하다.",
        en: "Multi-venue bar-hopping ('2차', '3차') is common, often ending at a karaoke bar.",
        es: "El recorrido de bares en múltiples lugares ('2차', '3차') es común, a menudo terminando en un karaoke.",
      },
    ],
    etiquette: [
      {
        ko: "어른 앞에서는 두 손으로 잔을 받고 따르며, 고개를 옆으로 돌려 마시는 것이 예의다.",
        en: "Use both hands when receiving or pouring a drink for elders, and turn your head slightly away when drinking in their presence.",
        es: "Usa ambas manos al recibir o servir una bebida para los mayores, y gira la cabeza ligeramente al beber en su presencia.",
      },
      {
        ko: "윗사람의 잔이 비면 먼저 채워주는 것이 예의이며, 자신의 잔은 스스로 채우지 않는 것이 관습이다.",
        en: "It is courteous to refill an elder's empty glass; refilling your own glass is generally avoided.",
        es: "Es cortés rellenar el vaso vacío de un mayor; generalmente se evita rellenar el propio vaso.",
      },
    ],
  },
  {
    id: "japan",
    emoji: "🇯🇵",
    country: { ko: "일본", en: "Japan", es: "Japón" },
    customs: [
      {
        ko: "이자카야(居酒屋) 문화가 발달해 있으며, 퇴근 후 동료들과 가볍게 한잔하는 '노미카이(飲み会)' 문화가 일상적이다.",
        en: "Izakaya culture is deeply rooted; after-work drinking gatherings ('nomikai') are a regular social ritual.",
        es: "La cultura izakaya está profundamente arraigada; las reuniones de bebida después del trabajo ('nomikai') son un ritual social habitual.",
      },
      {
        ko: "사케, 소주, 맥주, 하이볼 등 다양한 술을 즐기며, 계절이나 분위기에 맞는 술을 고르는 것을 중요하게 여긴다.",
        en: "A wide variety of drinks including sake, shochu, beer, and highballs are enjoyed; choosing a drink suited to the season and setting is appreciated.",
        es: "Se disfruta de una amplia variedad de bebidas como sake, shochu, cerveza e highballs; se aprecia elegir una bebida adecuada a la temporada y el ambiente.",
      },
    ],
    etiquette: [
      {
        ko: "'간파이(乾杯)' 건배를 할 때 잔을 너무 높이 들거나 부딪히지 않는 것이 세련된 예의로 여겨진다.",
        en: "During 'kanpai' (cheers), clinking glasses too forcefully or too high is considered impolite in formal settings.",
        es: "Durante el 'kanpai' (brindis), chocar los vasos con demasiada fuerza o muy alto se considera descortés en ambientes formales.",
      },
      {
        ko: "다른 사람의 잔이 비어 있으면 먼저 채워주는 것이 예의이며, 자신의 잔은 상대방이 채워줄 때까지 기다리는 것이 관습이다.",
        en: "Pouring for others before yourself is expected; wait for others to refill your glass rather than helping yourself.",
        es: "Se espera servir a los demás antes que a uno mismo; espera a que otros te llenen el vaso en lugar de hacerlo tú.",
      },
      {
        ko: "술을 마시지 않아도 건배에 참여하는 것이 예의이며, 거절할 때는 정중하게 이유를 설명하는 것이 좋다.",
        en: "Participating in the toast even with a non-alcoholic drink is polite; declining alcohol should be done graciously.",
        es: "Participar en el brindis incluso con una bebida sin alcohol es cortés; rechazar el alcohol debe hacerse con gracia.",
      },
    ],
  },
  {
    id: "china",
    emoji: "🇨🇳",
    country: { ko: "중국", en: "China", es: "China" },
    customs: [
      {
        ko: "바이주(白酒)는 중국의 대표적인 증류주로, 공식적인 연회나 비즈니스 자리에서 주로 이용된다.",
        en: "Baijiu (Chinese liquor) is the iconic spirit, often consumed at formal banquets and business dinners.",
        es: "El baijiu (licor chino) es el espíritu icónico, consumido frecuentemente en banquetes formales y cenas de negocios.",
      },
      {
        ko: "'간베이(乾杯)'는 단번에 잔을 비우는 의미로 쓰이는 경우가 많아, 권유 시 완전히 마시도록 유도하는 문화가 있다.",
        en: "'Ganbei' (cheers) often implies draining the glass in one go; pressure to do so is common in social settings.",
        es: "'Ganbei' (brindis) a menudo implica vaciar el vaso de un trago; la presión para hacerlo es común en entornos sociales.",
      },
    ],
    etiquette: [
      {
        ko: "연장자나 지위가 높은 사람에게 먼저 술을 따르는 것이 기본 예의이다.",
        en: "Pouring drinks for elders or those of higher status before yourself is fundamental etiquette.",
        es: "Servir bebidas a los mayores o a quienes tienen un estatus más alto antes que a uno mismo es una etiqueta fundamental.",
      },
      {
        ko: "건배할 때 상대방보다 잔을 낮게 드는 것이 존중의 표현이다.",
        en: "Holding your glass slightly lower than the other person's during a toast is a sign of respect.",
        es: "Sostener el vaso ligeramente más bajo que el de la otra persona durante un brindis es señal de respeto.",
      },
    ],
  },
  {
    id: "france",
    emoji: "🇫🇷",
    country: { ko: "프랑스", en: "France", es: "Francia" },
    customs: [
      {
        ko: "와인은 식사의 일부로 여겨지며, 음식과의 조화(마리아주)를 중요하게 생각한다.",
        en: "Wine is considered an integral part of the meal; pairing wine with food ('mariage') is taken seriously.",
        es: "El vino se considera parte integral de la comida; el maridaje del vino con la comida ('mariage') se toma en serio.",
      },
      {
        ko: "아페리티프(식전주)와 디제스티프(식후주) 문화가 잘 발달되어 있어, 식사 전후로 가볍게 한잔하는 관습이 있다.",
        en: "The tradition of 'apéritif' (pre-dinner drink) and 'digestif' (after-dinner drink) is well-established.",
        es: "La tradición del 'apéritif' (bebida antes de cenar) y el 'digestif' (bebida después de cenar) está bien establecida.",
      },
    ],
    etiquette: [
      {
        ko: "건배할 때는 반드시 상대방의 눈을 바라보는 것이 예의이며, 이를 지키지 않으면 불운이 온다는 미신도 있다.",
        en: "Making eye contact during a toast is considered polite; failing to do so is said to bring bad luck.",
        es: "Hacer contacto visual durante un brindis se considera cortés; se dice que no hacerlo trae mala suerte.",
      },
      {
        ko: "와인 잔을 너무 가득 채우는 것보다는 적당히 따르는 것이 세련된 매너로 여겨진다.",
        en: "Pouring wine to about one-third of the glass is considered more refined than filling it to the brim.",
        es: "Servir vino hasta aproximadamente un tercio del vaso se considera más refinado que llenarlo hasta el borde.",
      },
    ],
  },
  {
    id: "italy",
    emoji: "🇮🇹",
    country: { ko: "이탈리아", en: "Italy", es: "Italia" },
    customs: [
      {
        ko: "이탈리아인들은 와인을 식사와 함께 즐기는 것이 일반적이며, 지역마다 다양한 지역 와인 문화가 발달해 있다.",
        en: "Italians typically enjoy wine with meals; each region has developed its own distinct wine culture.",
        es: "Los italianos típicamente disfrutan el vino con las comidas; cada región ha desarrollado su propia cultura vinícola.",
      },
      {
        ko: "아페롤 스프리츠, 네그로니 등 아페리티보(식전주) 문화가 일상적이며, 저녁 식사 전 가볍게 즐기는 '아페리티보 시간'이 있다.",
        en: "Aperitivo culture is a daily ritual; Aperol Spritz and Negroni are typical choices enjoyed before dinner.",
        es: "La cultura del aperitivo es un ritual diario; el Aperol Spritz y el Negroni son opciones típicas antes de cenar.",
      },
    ],
    etiquette: [
      {
        ko: "건배 시 반드시 눈을 마주치고 '살루테(Salute)!'를 외치는 것이 예의다.",
        en: "Saying 'Salute!' while making eye contact during a toast is customary.",
        es: "Decir '¡Salute!' mientras se hace contacto visual durante un brindis es una costumbre.",
      },
      {
        ko: "식사 중 카푸치노를 마시는 것은 예절에 어긋나듯, 식사와 어울리지 않는 음료를 선택하는 것은 눈살을 찌푸리게 한다.",
        en: "Just as ordering a cappuccino during a meal is frowned upon, pairing mismatched drinks with food is considered poor taste.",
        es: "Al igual que pedir un cappuccino durante una comida está mal visto, combinar bebidas que no encajan con la comida se considera de mal gusto.",
      },
    ],
  },
  {
    id: "mexico",
    emoji: "🇲🇽",
    country: { ko: "멕시코", en: "Mexico", es: "México" },
    customs: [
      {
        ko: "테킬라는 국민 술로, 원샷으로 마시거나 마르가리타 칵테일로 즐기는 것이 일반적이다.",
        en: "Tequila is the national spirit, enjoyed as a shot or in cocktails like margaritas.",
        es: "El tequila es el espíritu nacional, disfrutado en shots o en cócteles como margaritas.",
      },
      {
        ko: "세르베사(맥주)도 매우 인기 있으며, 특히 라임을 곁들인 코로나 스타일로 즐기는 것이 보편적이다.",
        en: "Beer ('cerveza') is also very popular; drinking it with lime in the corona style is widespread.",
        es: "La cerveza también es muy popular; beberla con limón al estilo corona es muy común.",
      },
    ],
    etiquette: [
      {
        ko: "건배할 때는 '살루드(¡Salud!)'를 외치며, 여러 사람이 모인 자리에서는 모두와 잔을 부딪히는 것이 예의다.",
        en: "Saying '¡Salud!' during toasts is customary; clinking glasses with everyone present is polite.",
        es: "Decir '¡Salud!' durante los brindis es costumbre; es cortés brindar con todos los presentes.",
      },
      {
        ko: "테킬라를 마실 때 소금과 라임(레몬)을 함께 사용하는 것은 전통적인 방법이며, 이를 통해 향미를 더 즐길 수 있다.",
        en: "Using salt and lime alongside tequila is traditional and enhances the flavor experience.",
        es: "Usar sal y limón junto al tequila es tradicional y mejora la experiencia de sabor.",
      },
    ],
  },
  {
    id: "germany",
    emoji: "🇩🇪",
    country: { ko: "독일", en: "Germany", es: "Alemania" },
    customs: [
      {
        ko: "맥주 순수령(Reinheitsgebot)을 바탕으로 한 맥주 문화가 세계적으로 유명하며, 매년 10월 뮌헨 옥토버페스트가 열린다.",
        en: "Germany's beer culture rooted in the Reinheitsgebot (Purity Law) is world-famous; the Munich Oktoberfest draws millions annually.",
        es: "La cultura cervecera de Alemania, arraigada en la Reinheitsgebot (Ley de Pureza), es famosa mundialmente; el Oktoberfest de Múnich atrae millones anualmente.",
      },
      {
        ko: "비어가르텐(야외 맥주 정원)에서 1리터 잔 '마스(Maß)'로 맥주를 즐기는 것이 여름철 일상적인 문화다.",
        en: "Enjoying a Maß (1-liter mug) of beer at a Biergarten (beer garden) is a quintessential summer activity.",
        es: "Disfrutar de una Maß (jarra de 1 litro) de cerveza en un Biergarten (jardín de cerveza) es una actividad veraniega quintaesencial.",
      },
    ],
    etiquette: [
      {
        ko: "건배할 때는 '프로스트(Prost)!'를 외치며, 반드시 눈을 마주치는 것이 예의다. 눈을 마주치지 않으면 7년의 불운이 온다는 속설이 있다.",
        en: "Saying 'Prost!' while making firm eye contact is essential; German superstition holds that failing to do so brings seven years of bad luck.",
        es: "Decir '¡Prost!' mientras se hace contacto visual firme es esencial; la superstición alemana dice que no hacerlo trae siete años de mala suerte.",
      },
      {
        ko: "잔이 테이블에 있을 때 건배하는 것이 일반적이며, 잔을 들었다 내려놓기 전에 한 모금 이상 마시는 것을 기대하는 경우도 있다.",
        en: "Toasting with glasses on the table is common; it is sometimes expected to take at least one sip before setting the glass down.",
        es: "Brindar con los vasos sobre la mesa es común; a veces se espera tomar al menos un sorbo antes de poner el vaso.",
      },
    ],
  },
  {
    id: "spain",
    emoji: "🇪🇸",
    country: { ko: "스페인", en: "Spain", es: "España" },
    customs: [
      {
        ko: "타파스(소량의 안주)를 곁들이며 여러 바를 돌아다니는 '타페오(tapeo)' 문화가 발달해 있다.",
        en: "The tradition of 'tapeo'—hopping between bars while enjoying tapas (small snacks)—is a cornerstone of Spanish social life.",
        es: "La tradición del 'tapeo'—ir de bar en bar disfrutando tapas (pequeños aperitivos)—es una piedra angular de la vida social española.",
      },
      {
        ko: "상그리아(과일을 넣은 와인 음료)와 세르베사(맥주)가 대중적이며, 식전에 가볍게 마시는 베르무트(베르무) 문화도 있다.",
        en: "Sangria and beer are widely popular; the Sunday tradition of drinking vermouth ('vermú') before lunch is also cherished.",
        es: "La sangria y la cerveza son muy populares; la tradición dominical de tomar vermut ('vermú') antes del almuerzo también es apreciada.",
      },
    ],
    etiquette: [
      {
        ko: "건배 시 '살루드(¡Salud)!'를 외치며 모든 사람과 눈을 마주치는 것이 예의다.",
        en: "Saying '¡Salud!' and making eye contact with everyone during a toast is courteous.",
        es: "Decir '¡Salud!' y hacer contacto visual con todos durante un brindis es cortés.",
      },
      {
        ko: "식사 자리에서 과도하게 마시는 것보다 천천히 사교적으로 즐기는 것을 더 중시하며, 대화와 음식이 음주의 중심이 된다.",
        en: "Drinking slowly and socially is valued over getting drunk; conversation and food remain central to the experience.",
        es: "Se valora beber despacio y de forma social sobre emborracharse; la conversación y la comida siguen siendo centrales en la experiencia.",
      },
    ],
  },
] as const;
