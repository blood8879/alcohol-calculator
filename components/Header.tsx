import React from "react";
import { View, Text, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const Header = () => {
  return (
    <SafeAreaView className="bg-primary">
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">주류 계산기</Text>
        <Text className="text-white text-sm opacity-80">
          간단하고 정확한 주류 계산
        </Text>
      </View>
    </SafeAreaView>
  );
};
