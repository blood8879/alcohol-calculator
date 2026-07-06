import { LocalizedText } from "../utils/localizedText";

/**
 * Short educational context for each calculator: what it does, when to use it,
 * and how the result is derived. Surfaced as an info panel so the calculators
 * (the app's core strength) carry supporting knowledge. Not medical or legal
 * advice; results are estimates.
 */
export type CalculatorGuide = {
  readonly what: LocalizedText;
  readonly when: LocalizedText;
  readonly formula: LocalizedText;
};

export const calculatorGuides: Record<string, CalculatorGuide> = {
  dilution: {
    what: {
      ko: "현재 도수의 술을 목표 도수로 낮추려면 물을 얼마나 더해야 하는지 계산합니다.",
      en: "Calculates how much water to add to bring a drink down to a target ABV.",
      es: "Calcula cuánta agua añadir para bajar una bebida al ABV objetivo.",
    },
    when: {
      ko: "독한 술을 마시기 편하게 희석하거나, 하이볼·믹스 도수를 맞출 때 유용합니다.",
      en: "Useful for softening strong spirits or dialing in a highball or mix.",
      es: "Útil para suavizar destilados fuertes o ajustar un highball o mezcla.",
    },
    formula: {
      ko: "순알코올량은 그대로 두고 전체 부피를 늘립니다: 추가 물 = (현재도수/목표도수 − 1) × 현재 부피.",
      en: "Keeps pure alcohol fixed while raising total volume: added water = (current ABV / target ABV − 1) × current volume.",
      es: "Mantiene el alcohol y sube el volumen: agua = (ABV actual / ABV objetivo − 1) × volumen.",
    },
  },
  blending: {
    what: {
      ko: "도수가 다른 두 술을 섞었을 때 최종 도수와 부피를 계산합니다.",
      en: "Calculates the final ABV and volume when blending two drinks of different strength.",
      es: "Calcula el ABV y volumen final al mezclar dos bebidas de distinta graduación.",
    },
    when: {
      ko: "칵테일을 직접 만들거나 두 술을 섞기 전 예상 도수를 확인할 때 씁니다.",
      en: "Use it when mixing your own cocktail or previewing the strength of a blend.",
      es: "Úsalo al preparar un cóctel o anticipar la graduación de una mezcla.",
    },
    formula: {
      ko: "최종 도수는 각 술의 (부피 × 도수) 합을 전체 부피로 나눈 가중평균입니다.",
      en: "Final ABV is the volume-weighted average: sum of (volume × ABV) divided by total volume.",
      es: "El ABV final es el promedio ponderado: suma de (volumen × ABV) entre el volumen total.",
    },
  },
  calorie: {
    what: {
      ko: "용량과 도수로 술 한 잔의 대략적인 칼로리를 추정합니다.",
      en: "Estimates the approximate calories in a drink from its volume and ABV.",
      es: "Estima las calorías aproximadas de una bebida por su volumen y ABV.",
    },
    when: {
      ko: "식단을 관리하거나 어떤 술이 더 가벼운지 비교할 때 참고하세요.",
      en: "Handy for managing intake or comparing which drink is lighter.",
      es: "Útil para controlar el consumo o comparar qué bebida es más ligera.",
    },
    formula: {
      ko: "알코올은 1g당 약 7kcal입니다. 순알코올 무게(부피 × 도수 × 0.789)에 7을 곱해 추정합니다(당류 제외).",
      en: "Alcohol is about 7 kcal per gram. Estimate from pure-alcohol mass (volume × ABV × 0.789) × 7, excluding added sugar.",
      es: "El alcohol aporta ~7 kcal/g. Se estima por masa de alcohol (volumen × ABV × 0,789) × 7, sin azúcar.",
    },
  },
  temperature: {
    what: {
      ko: "측정 온도에 따라 달라지는 도수계 값을 표준 온도(20°C) 기준으로 보정합니다.",
      en: "Corrects a hydrometer ABV reading to the standard reference temperature (20°C).",
      es: "Corrige la lectura de ABV del densímetro a la temperatura estándar (20°C).",
    },
    when: {
      ko: "직접 술을 빚거나 도수를 정밀하게 측정할 때 온도 오차를 줄여줍니다.",
      en: "Reduces temperature error when home-brewing or measuring ABV precisely.",
      es: "Reduce el error térmico al elaborar o medir el ABV con precisión.",
    },
    formula: {
      ko: "알코올은 온도에 따라 팽창·수축하므로, 측정 온도와 기준 온도의 차이만큼 도수를 보정합니다.",
      en: "Alcohol expands and contracts with temperature, so the reading is adjusted by the gap from the reference temperature.",
      es: "El alcohol se dilata con la temperatura, así que se ajusta por la diferencia con la referencia.",
    },
  },
  alcoholContent: {
    what: {
      ko: "용량과 도수로 술 안에 든 순수 알코올의 양(g 또는 ml)을 계산합니다.",
      en: "Calculates the amount of pure alcohol (in grams or ml) contained in a drink.",
      es: "Calcula la cantidad de alcohol puro (en gramos o ml) que contiene una bebida.",
    },
    when: {
      ko: "표준잔 환산이나 섭취량 비교의 기준값이 됩니다.",
      en: "Serves as the basis for standard-drink conversion and intake comparison.",
      es: "Es la base para convertir a tragos estándar y comparar consumo.",
    },
    formula: {
      ko: "순알코올 부피 = 전체 부피 × (도수 ÷ 100). 무게(g)는 여기에 알코올 밀도 0.789를 곱합니다.",
      en: "Pure alcohol volume = total volume × (ABV ÷ 100). Mass in grams multiplies that by alcohol's density, 0.789.",
      es: "Volumen de alcohol = volumen × (ABV ÷ 100). La masa multiplica por la densidad 0,789.",
    },
  },
  freezingPoint: {
    what: {
      ko: "도수에 따른 술의 대략적인 어는점을 추정합니다.",
      en: "Estimates the approximate freezing point of a drink based on its ABV.",
      es: "Estima el punto de congelación aproximado de una bebida según su ABV.",
    },
    when: {
      ko: "냉동고에 술을 얼릴 수 있는지, 슬러시로 만들 수 있는지 가늠할 때 유용합니다.",
      en: "Handy for judging whether a drink will freeze in your freezer or turn slushy.",
      es: "Útil para saber si una bebida se congelará o quedará tipo granizado.",
    },
    formula: {
      ko: "도수가 높을수록 어는점이 낮아집니다. 도수 40% 안팎의 증류주는 가정용 냉동고에서 얼지 않습니다.",
      en: "Higher ABV lowers the freezing point; spirits near 40% won't freeze in a home freezer.",
      es: "Más ABV baja el punto de congelación; los destilados al 40% no se congelan en casa.",
    },
  },
  proof: {
    what: {
      ko: "도수(%)와 프루프(proof) 단위를 서로 변환합니다.",
      en: "Converts between ABV percentage and proof units.",
      es: "Convierte entre porcentaje de ABV y unidades de proof.",
    },
    when: {
      ko: "미국 라벨의 proof 표기를 도수로 바꿔 이해할 때 씁니다.",
      en: "Use it to read US 'proof' labels in terms of ABV.",
      es: "Úsalo para entender las etiquetas 'proof' de EE. UU. en ABV.",
    },
    formula: {
      ko: "미국 기준 프루프 = 도수 × 2. 예: 도수 40% → 80 proof.",
      en: "In the US, proof = ABV × 2. Example: 40% ABV → 80 proof.",
      es: "En EE. UU., proof = ABV × 2. Ejemplo: 40% ABV → 80 proof.",
    },
  },
  bac: {
    what: {
      ko: "체중·성별·마신 양·경과 시간으로 혈중알코올농도(BAC)를 추정합니다.",
      en: "Estimates blood alcohol concentration (BAC) from weight, sex, amount, and time elapsed.",
      es: "Estima la concentración de alcohol en sangre (BAC) por peso, sexo, cantidad y tiempo.",
    },
    when: {
      ko: "음주 후 몸 상태를 가늠하는 참고용입니다. 운전 가능 여부 판단에는 절대 쓰지 마세요.",
      en: "A reference for gauging how you feel — never use it to decide whether to drive.",
      es: "Una referencia para tu estado; nunca para decidir si conducir.",
    },
    formula: {
      ko: "위드마크 공식 기반: BAC ≈ 알코올량(g) ÷ (체중 × 체액계수 r) − 0.015 × 시간. r은 남성 0.68, 여성 0.55.",
      en: "Based on the Widmark formula: BAC ≈ alcohol grams ÷ (body weight × factor r) − 0.015 × hours, with r ≈ 0.68 (male) / 0.55 (female).",
      es: "Fórmula de Widmark: BAC ≈ gramos de alcohol ÷ (peso × factor r) − 0,015 × horas; r ≈ 0,68 (h) / 0,55 (m).",
    },
  },
  unitConverter: {
    what: {
      ko: "ml·oz·shot 등 술과 관련된 부피 단위를 서로 변환합니다.",
      en: "Converts between drink-related volume units like ml, oz, and shots.",
      es: "Convierte unidades de volumen como ml, oz y shots.",
    },
    when: {
      ko: "해외 레시피의 oz를 ml로 바꾸거나 잔 용량을 환산할 때 씁니다.",
      en: "Use it to turn oz in foreign recipes into ml or to convert glass sizes.",
      es: "Úsalo para pasar onzas de recetas extranjeras a ml o convertir vasos.",
    },
    formula: {
      ko: "기준 환산: 1 oz ≈ 29.57ml, 1 shot ≈ 44ml(1.5oz). 레시피마다 기준이 다를 수 있습니다.",
      en: "Reference: 1 oz ≈ 29.57 ml, 1 shot ≈ 44 ml (1.5 oz). Standards vary by recipe.",
      es: "Referencia: 1 oz ≈ 29,57 ml, 1 shot ≈ 44 ml (1,5 oz). Varía según la receta.",
    },
  },
};

export const getCalculatorGuide = (
  calculatorType: string | undefined
): CalculatorGuide | undefined =>
  calculatorType ? calculatorGuides[calculatorType] : undefined;
