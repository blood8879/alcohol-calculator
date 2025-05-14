import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type CalculatorIconProps = {
  icon: string;
  label: string;
  description: string;
  iconColor: string;
  onPress: () => void;
};

const CalculatorIcon = ({
  icon,
  label,
  description,
  iconColor,
  onPress,
}: CalculatorIconProps) => {
  return (
    <TouchableOpacity
      className="w-full bg-gray-800 rounded-xl p-4 mb-4"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View
          className={`w-12 h-12 ${iconColor} rounded-full items-center justify-center`}
        >
          <Text className="text-2xl">{icon}</Text>
        </View>
        <Text className="text-gray-400 text-2xl">›</Text>
      </View>
      <Text className="text-white text-base font-semibold">{label}</Text>
      <Text className="text-white text-xs opacity-70 mt-1">{description}</Text>
    </TouchableOpacity>
  );
};

export default CalculatorIcon;
