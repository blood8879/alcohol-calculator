import React, { useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { drinkPresets } from "../data/drinkPresets";
import { DrinkPreset } from "../data/types";
import { addDrinkLog } from "../utils/trackerStorage";

interface AddDrinkModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
}

type Mode = "preset" | "manual";

const AddDrinkModal = ({ visible, onClose, onAdd }: AddDrinkModalProps) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("preset");
  const [selectedPreset, setSelectedPreset] = useState<DrinkPreset | null>(null);
  const [volume, setVolume] = useState("");
  const [abv, setAbv] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualEmoji, setManualEmoji] = useState("\uD83C\uDF7A");

  const resetForm = useCallback(() => {
    setSelectedPreset(null);
    setVolume("");
    setAbv("");
    setManualName("");
    setManualEmoji("\uD83C\uDF7A");
    setMode("preset");
  }, []);

  const handleSelectPreset = useCallback((preset: DrinkPreset) => {
    setSelectedPreset(preset);
    setVolume(String(preset.volume));
    setAbv(String(preset.abv));
  }, []);

  const handleAdd = useCallback(async () => {
    const parsedVolume = parseFloat(volume);
    const parsedAbv = parseFloat(abv);

    if (isNaN(parsedVolume) || isNaN(parsedAbv) || parsedVolume <= 0 || parsedAbv <= 0) {
      Alert.alert(t("common.error"), t("errors.positiveValues"));
      return;
    }

    if (mode === "manual" && !manualName.trim()) {
      Alert.alert(t("common.error"), t("tracker.drinkName"));
      return;
    }

    const name =
      mode === "preset" && selectedPreset
        ? t(selectedPreset.nameKey)
        : manualName.trim();

    const emoji =
      mode === "preset" && selectedPreset
        ? selectedPreset.emoji
        : manualEmoji;

    await addDrinkLog({
      name,
      emoji,
      volume: parsedVolume,
      abv: parsedAbv,
      presetId: mode === "preset" ? selectedPreset?.id : undefined,
    });

    resetForm();
    onAdd();
    onClose();
  }, [volume, abv, mode, manualName, manualEmoji, selectedPreset, t, resetForm, onAdd, onClose]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const canAdd =
    mode === "preset"
      ? selectedPreset !== null && volume !== "" && abv !== ""
      : manualName.trim() !== "" && volume !== "" && abv !== "";

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={["down"]}
      style={{ justifyContent: "flex-end", margin: 0 }}
      propagateSwipe={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      avoidKeyboard={true}
    >
      <View className="bg-gray-900 rounded-t-3xl p-4 max-h-[85%]">
        <View className="w-10 h-1 bg-gray-600 rounded-full self-center mb-4" />

        <Text className="text-white text-xl font-bold mb-4">
          {t("tracker.addDrink")}
        </Text>

        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 rounded-xl py-3 mr-2 items-center ${
              mode === "preset" ? "bg-green-500" : "bg-gray-800"
            }`}
            onPress={() => setMode("preset")}
          >
            <Text
              className={`font-semibold ${
                mode === "preset" ? "text-white" : "text-gray-400"
              }`}
            >
              {t("tracker.preset")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 rounded-xl py-3 items-center ${
              mode === "manual" ? "bg-green-500" : "bg-gray-800"
            }`}
            onPress={() => setMode("manual")}
          >
            <Text
              className={`font-semibold ${
                mode === "manual" ? "text-white" : "text-gray-400"
              }`}
            >
              {t("tracker.manual")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {mode === "preset" ? (
            <View>
              <View className="flex-row flex-wrap mb-4">
                {drinkPresets.map((preset) => {
                  const isSelected = selectedPreset?.id === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      className={`rounded-xl px-3 py-2 mr-2 mb-2 flex-row items-center border-2 ${
                        isSelected
                          ? "border-green-500 bg-gray-800"
                          : "border-transparent bg-gray-800"
                      }`}
                      onPress={() => handleSelectPreset(preset)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-lg mr-1.5">{preset.emoji}</Text>
                      <Text
                        className={`text-sm ${
                          isSelected ? "text-green-400 font-semibold" : "text-gray-300"
                        }`}
                      >
                        {t(preset.nameKey)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedPreset && (
                <View>
                  <Text className="text-gray-400 text-sm mb-2">
                    {t("tracker.volume")} (ml)
                  </Text>
                  <TextInput
                    className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                    value={volume}
                    onChangeText={setVolume}
                    keyboardType="numeric"
                    placeholderTextColor="#6b7280"
                  />

                  <Text className="text-gray-400 text-sm mb-2">
                    {t("tracker.abv")} (%)
                  </Text>
                  <TextInput
                    className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                    value={abv}
                    onChangeText={setAbv}
                    keyboardType="numeric"
                    placeholderTextColor="#6b7280"
                  />
                </View>
              )}
            </View>
          ) : (
            <View>
              <Text className="text-gray-400 text-sm mb-2">
                {t("tracker.drinkName")}
              </Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                value={manualName}
                onChangeText={setManualName}
                placeholder={t("tracker.drinkName")}
                placeholderTextColor="#6b7280"
              />

              <Text className="text-gray-400 text-sm mb-2">{t("tracker.emoji")}</Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                value={manualEmoji}
                onChangeText={setManualEmoji}
                placeholderTextColor="#6b7280"
              />

              <Text className="text-gray-400 text-sm mb-2">
                {t("tracker.volume")} (ml)
              </Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                value={volume}
                onChangeText={setVolume}
                keyboardType="numeric"
                placeholderTextColor="#6b7280"
              />

              <Text className="text-gray-400 text-sm mb-2">
                {t("tracker.abv")} (%)
              </Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                value={abv}
                onChangeText={setAbv}
                keyboardType="numeric"
                placeholderTextColor="#6b7280"
              />
            </View>
          )}

          <TouchableOpacity
            className={`rounded-xl p-4 items-center mt-2 mb-4 ${
              canAdd ? "bg-green-500" : "bg-gray-700"
            }`}
            onPress={handleAdd}
            disabled={!canAdd}
            activeOpacity={0.7}
          >
            <Text
              className={`text-base font-bold ${
                canAdd ? "text-white" : "text-gray-500"
              }`}
            >
              <Ionicons name="add-circle-outline" size={18} color={canAdd ? "#fff" : "#6B7280"} />{" "}
              {t("tracker.addDrink")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AddDrinkModal;
