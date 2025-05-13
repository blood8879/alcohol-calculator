import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";

// 계산 카드 컴포넌트
const CalculationCard = ({
  title,
  description,
  fields,
  calculateResult,
}: {
  title: string;
  description: string;
  fields: { label: string; unit: string; placeholder: string }[];
  calculateResult: (values: number[]) => { label: string; value: string }[];
}) => {
  const [values, setValues] = useState<number[]>(Array(fields.length).fill(0));
  const [results, setResults] = useState<{ label: string; value: string }[]>(
    []
  );

  const handleInputChange = (text: string, index: number) => {
    const newValues = [...values];
    newValues[index] = Number(text) || 0;
    setValues(newValues);
  };

  const handleCalculate = () => {
    const calculatedResults = calculateResult(values);
    setResults(calculatedResults);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>

      <View style={styles.cardBody}>
        {fields.map((field, index) => (
          <View key={index} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                keyboardType="numeric"
                onChangeText={(text) => handleInputChange(text, index)}
              />
              <Text style={styles.unitText}>{field.unit}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={handleCalculate}
        >
          <Text style={styles.buttonText}>계산하기</Text>
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultContainer}>
            {results.map((result, index) => (
              <View key={index} style={styles.resultRow}>
                <Text style={styles.resultLabel}>{result.label}</Text>
                <Text style={styles.resultValue}>{result.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// 메인 화면
export default function HomeScreen() {
  const dilutionFields = [
    { label: "현재 용량", unit: "ml", placeholder: "0" },
    { label: "현재 도수", unit: "%", placeholder: "0" },
    { label: "목표 도수", unit: "%", placeholder: "0" },
  ];

  const alcoholContentFields = [
    { label: "용량", unit: "ml", placeholder: "0" },
    { label: "도수", unit: "%", placeholder: "0" },
  ];

  const temperatureFields = [
    { label: "측정 온도", unit: "°C", placeholder: "0" },
    { label: "측정 도수", unit: "%", placeholder: "0" },
  ];

  // 도수 조정 계산
  const calculateDilution = (values: number[]) => {
    const [currentVolume, currentABV, targetABV] = values;

    if (
      currentABV <= targetABV ||
      currentVolume <= 0 ||
      currentABV <= 0 ||
      targetABV <= 0
    ) {
      return [
        { label: "오류", value: "현재 도수는 목표 도수보다 높아야 합니다" },
      ];
    }

    const finalVolume = (currentVolume * currentABV) / targetABV;
    const waterToAdd = finalVolume - currentVolume;

    return [
      { label: "추가할 물의 양", value: `${waterToAdd.toFixed(2)} ml` },
      { label: "최종 용량", value: `${finalVolume.toFixed(2)} ml` },
    ];
  };

  // 순알코올량 계산
  const calculateAlcoholContent = (values: number[]) => {
    const [volume, abv] = values;

    if (volume <= 0 || abv <= 0) {
      return [{ label: "오류", value: "모든 값은 0보다 커야 합니다" }];
    }

    const pureAlcohol = volume * (abv / 100);

    return [{ label: "순알코올량", value: `${pureAlcohol.toFixed(2)} ml` }];
  };

  // 온도별 도수 보정
  const calculateTemperatureCorrection = (values: number[]) => {
    const [temperature, measuredABV] = values;

    if (measuredABV <= 0) {
      return [{ label: "오류", value: "도수는 0보다 커야 합니다" }];
    }

    const tempDifference = temperature - 20;
    const correctionFactor = tempDifference * 0.35;
    const correctedABV = measuredABV + correctionFactor;

    return [
      { label: "20°C 기준 보정 도수", value: `${correctedABV.toFixed(2)} %` },
    ];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      <View style={styles.header}>
        <Text style={styles.title}>주류 계산기</Text>
        <Text style={styles.subtitle}>간단하고 정확한 주류 계산</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <CalculationCard
          title="도수 조정 계산"
          description="현재 도수와 용량에서 원하는 도수로 만들기 위해 필요한 물의 양 계산"
          fields={dilutionFields}
          calculateResult={calculateDilution}
        />

        <CalculationCard
          title="알코올 순함량 계산"
          description="주어진 용량과 도수에 따른 순알코올량 계산"
          fields={alcoholContentFields}
          calculateResult={calculateAlcoholContent}
        />

        <CalculationCard
          title="온도별 도수 보정"
          description="측정 온도에서 20°C 기준 도수로 보정"
          fields={temperatureFields}
          calculateResult={calculateTemperatureCorrection}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.8,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    backgroundColor: "#4CAF50",
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  cardDescription: {
    fontSize: 14,
    color: "white",
    opacity: 0.8,
    marginTop: 4,
  },
  cardBody: {
    padding: 16,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 130,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    flex: 1,
    textAlign: "right",
  },
  unitText: {
    marginLeft: 8,
    color: "#333",
  },
  calculateButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 16,
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 16,
    color: "#333",
  },
  resultValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
});
