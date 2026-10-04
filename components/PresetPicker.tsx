import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { DrinkPreset } from "../data/types";

export type PresetPickerProps = {
  presets: DrinkPreset[];
  onSelect: (preset: DrinkPreset) => void;
};

const PresetPicker = ({ presets, onSelect }: PresetPickerProps) => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (preset: DrinkPreset) => {
    setSelectedId(preset.id);
    onSelect(preset);
  };

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {presets.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <TouchableOpacity
              key={preset.id}
              className={`min-h-[44px] rounded-full px-4 mr-2 flex-row items-center border ${
                isSelected
                  ? "bg-accentButton border-accentButton"
                  : "bg-surface border-surfaceDeep"
              }`}
              onPress={() => handleSelect(preset)}
              accessibilityRole="button"
              accessibilityLabel={t(preset.nameKey)}
              accessibilityState={{ selected: isSelected }}
            >
              <Text className="text-base mr-1">{preset.emoji}</Text>
              <Text
                className={`text-sm ${
                  isSelected ? "text-textPrimary font-semibold" : "text-gray-200"
                }`}
              >
                {t(preset.nameKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default PresetPicker;
