import React from "react";
import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

interface StatsChartProps {
  data: { labels: string[]; values: number[] };
  color?: string;
  title: string;
}

const StatsChart = ({ data, color = "#22c55e", title }: StatsChartProps) => {
  const barData = data.labels.map((label, i) => ({
    value: data.values[i] || 0,
    label: label,
    frontColor: color,
  }));

  const maxValue = Math.max(...data.values, 1);

  return (
    <View className="bg-gray-800 rounded-xl p-4 mb-4">
      <Text className="text-white text-base font-semibold mb-3">{title}</Text>
      <BarChart
        data={barData}
        barWidth={20}
        noOfSections={4}
        maxValue={Math.ceil(maxValue * 1.2)}
        yAxisColor="#374151"
        xAxisColor="#374151"
        yAxisTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
        xAxisLabelTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
        backgroundColor="transparent"
        hideRules={false}
        rulesColor="#374151"
        spacing={16}
        isAnimated={false}
      />
    </View>
  );
};

export default StatsChart;
