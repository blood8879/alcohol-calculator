import React, { useState, useCallback, useEffect } from "react";
import {
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
import { CustomDrink, getCustomDrinks } from "../utils/customDrinks";
import { logDrinkLogged } from "../utils/analytics";
import { trackEngagement } from "../utils/engagementAnalytics";
import { useDialogController } from "./ui/DialogProvider";

interface AddDrinkModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
}

type Mode = "preset" | "manual";

const AddDrinkModal = ({ visible, onClose, onAdd }: AddDrinkModalProps) => {
  const { t } = useTranslation();
  // 이 컴포넌트 자체가 모달이므로 오류 토스트를 모달 안에 로컬로 렌더한다(루트 토스트는 모달 아래에 깔림).
  const dialog = useDialogController();
  const { toast } = dialog;
  const [mode, setMode] = useState<Mode>("preset");
  const [selectedPreset, setSelectedPreset] = useState<DrinkPreset | null>(null);
  const [volume, setVolume] = useState("");
  const [abv, setAbv] = useState("");
  const [price, setPrice] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualEmoji, setManualEmoji] = useState("\uD83C\uDF7A");
  const [customDrinks, setCustomDrinks] = useState<CustomDrink[]>([]);

  useEffect(() => {
    if (visible) {
      trackEngagement("tracker_add_opened");
      getCustomDrinks().then(setCustomDrinks);
    }
  }, [visible]);

  // \uCEE4\uC2A4\uD140 \uC220\uC744 \uD504\uB9AC\uC14B\uACFC \uB3D9\uC77C\uD55C \uD615\uD0DC\uB85C \uB178\uCD9C\uD55C\uB2E4.
  const customPresets: DrinkPreset[] = customDrinks.map((c) => ({
    id: c.id,
    nameKey: c.name,
    emoji: "\uD83C\uDF78",
    volume: c.volumeMl,
    abv: c.abv,
  }));
  const allPresets = [...drinkPresets, ...customPresets];

  const resetForm = useCallback(() => {
    setSelectedPreset(null);
    setVolume("");
    setAbv("");
    setPrice("");
    setManualName("");
    setManualEmoji("\uD83C\uDF7A");
    setMode("preset");
  }, []);

  const handleSelectPreset = useCallback(
    (preset: DrinkPreset) => {
      setSelectedPreset(preset);
      setVolume(String(preset.volume));
      setAbv(String(preset.abv));
      const custom = customDrinks.find((c) => c.id === preset.id);
      trackEngagement("tracker_add_mode_selected", { mode: custom ? "custom_preset" : "built_in_preset" });
      setPrice(custom?.price != null ? String(custom.price) : "");
    },
    [customDrinks]
  );

  const handleAdd = useCallback(async () => {
    const parsedVolume = parseFloat(volume);
    const parsedAbv = parseFloat(abv);

    if (isNaN(parsedVolume) || isNaN(parsedAbv) || parsedVolume <= 0 || parsedAbv <= 0) {
      trackEngagement("tracker_add_validation_failed", { reason: "invalid_amount" });
      toast({ message: t("errors.positiveValues"), variant: "error" });
      return;
    }

    if (mode === "manual" && !manualName.trim()) {
      trackEngagement("tracker_add_validation_failed", { reason: "missing_name" });
      toast({ message: t("tracker.drinkName"), variant: "error" });
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

    const parsedPrice = parseFloat(price);

    const saved = await addDrinkLog({
      name,
      emoji,
      volume: parsedVolume,
      abv: parsedAbv,
      price: !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : undefined,
      presetId: mode === "preset" ? selectedPreset?.id : undefined,
    });

    if (!saved) {
      trackEngagement("tracker_add_validation_failed", { reason: "storage_failed" });
      return;
    }
    logDrinkLogged(mode);
    trackEngagement("tracker_add_saved", { source: mode === "manual" ? "manual" : customDrinks.some((drink) => drink.id === selectedPreset?.id) ? "custom_preset" : "built_in_preset" });

    resetForm();
    onAdd();
    onClose();
  }, [volume, abv, price, mode, manualName, manualEmoji, selectedPreset, customDrinks, t, toast, resetForm, onAdd, onClose]);

  const handleClose = useCallback(() => {
    trackEngagement("tracker_add_closed", { mode, outcome: "abandoned" });
    resetForm();
    onClose();
  }, [mode, resetForm, onClose]);

  const canAdd =
    mode === "preset"
      ? selectedPreset !== null && volume !== "" && abv !== ""
      : manualName.trim() !== "" && volume !== "" && abv !== "";

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
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
              mode === "preset" ? "bg-accentButton" : "bg-gray-800"
            }`}
            onPress={() => { setMode("preset"); trackEngagement("tracker_add_mode_selected", { mode: "preset" }); }}
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
              mode === "manual" ? "bg-accentButton" : "bg-gray-800"
            }`}
            onPress={() => { setMode("manual"); trackEngagement("tracker_add_mode_selected", { mode: "manual" }); }}
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
                {allPresets.map((preset) => {
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
                    placeholderTextColor="#8b93a1"
                  />

                  <Text className="text-gray-400 text-sm mb-2">
                    {t("tracker.abv")} (%)
                  </Text>
                  <TextInput
                    className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                    value={abv}
                    onChangeText={setAbv}
                    keyboardType="numeric"
                    placeholderTextColor="#8b93a1"
                  />

                  <Text className="text-gray-400 text-sm mb-2">
                    {t("tracker.price")}
                  </Text>
                  <TextInput
                    className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#8b93a1"
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
                placeholderTextColor="#8b93a1"
              />

              <Text className="text-gray-400 text-sm mb-2">{t("tracker.emoji")}</Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                value={manualEmoji}
                onChangeText={setManualEmoji}
                placeholderTextColor="#8b93a1"
              />

              <Text className="text-gray-400 text-sm mb-2">
                {t("tracker.volume")} (ml)
              </Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                value={volume}
                onChangeText={setVolume}
                keyboardType="numeric"
                placeholderTextColor="#8b93a1"
              />

              <Text className="text-gray-400 text-sm mb-2">
                {t("tracker.abv")} (%)
              </Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                value={abv}
                onChangeText={setAbv}
                keyboardType="numeric"
                placeholderTextColor="#8b93a1"
              />

              <Text className="text-gray-400 text-sm mb-2">
                {t("tracker.price")}
              </Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#8b93a1"
              />
            </View>
          )}

          <TouchableOpacity
            className={`rounded-xl p-4 items-center mt-2 mb-4 ${
              canAdd ? "bg-accentButton" : "bg-gray-700"
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
      {dialog.host}
    </Modal>
  );
};

export default AddDrinkModal;
