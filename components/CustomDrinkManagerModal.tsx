import React, { useCallback, useEffect, useState } from "react";
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
import {
  CustomDrink,
  addCustomDrink,
  deleteCustomDrink,
  getCustomDrinks,
  standardDrinksOf,
  updateCustomDrink,
} from "../utils/customDrinks";

interface CustomDrinkManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onChange?: (drinks: CustomDrink[]) => void;
}

const CustomDrinkManagerModal = ({
  visible,
  onClose,
  onChange,
}: CustomDrinkManagerModalProps) => {
  const { t } = useTranslation();
  const [drinks, setDrinks] = useState<CustomDrink[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [abv, setAbv] = useState("");
  const [volume, setVolume] = useState("");
  const [price, setPrice] = useState("");

  const load = useCallback(async () => {
    const list = await getCustomDrinks();
    setDrinks(list);
    onChange?.(list);
  }, [onChange]);

  useEffect(() => {
    if (visible) {
      void load();
    }
  }, [visible, load]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setName("");
    setAbv("");
    setVolume("");
    setPrice("");
  }, []);

  const handleSubmit = useCallback(async () => {
    const parsedAbv = parseFloat(abv);
    const parsedVolume = parseFloat(volume);
    if (
      !name.trim() ||
      isNaN(parsedAbv) ||
      isNaN(parsedVolume) ||
      parsedAbv <= 0 ||
      parsedVolume <= 0
    ) {
      Alert.alert(t("common.error"), t("errors.positiveValues"));
      return;
    }
    const parsedPrice = parseFloat(price);
    const payload = {
      name: name.trim(),
      abv: parsedAbv,
      volumeMl: parsedVolume,
      price: !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : undefined,
    };
    const next = editingId
      ? await updateCustomDrink(editingId, payload)
      : await addCustomDrink(payload);
    setDrinks(next);
    onChange?.(next);
    resetForm();
  }, [name, abv, volume, price, editingId, t, onChange, resetForm]);

  const handleEdit = useCallback((drink: CustomDrink) => {
    setEditingId(drink.id);
    setName(drink.name);
    setAbv(String(drink.abv));
    setVolume(String(drink.volumeMl));
    setPrice(drink.price != null ? String(drink.price) : "");
  }, []);

  const handleDelete = useCallback(
    (drink: CustomDrink) => {
      Alert.alert(
        t("customDrinks.deleteTitle"),
        t("customDrinks.deleteMessage", { name: drink.name }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("customDrinks.delete"),
            style: "destructive",
            onPress: async () => {
              const next = await deleteCustomDrink(drink.id);
              setDrinks(next);
              onChange?.(next);
              if (editingId === drink.id) {
                resetForm();
              }
            },
          },
        ]
      );
    },
    [t, onChange, editingId, resetForm]
  );

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const canSubmit =
    name.trim() !== "" && abv !== "" && volume !== "";

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
      avoidKeyboard={true}
    >
      <View className="bg-gray-900 rounded-t-3xl p-4 max-h-[88%]">
        <View className="w-10 h-1 bg-gray-600 rounded-full self-center mb-4" />
        <Text className="text-white text-xl font-bold mb-4">
          {t("customDrinks.title")}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-gray-400 text-sm mb-2">
            {t("customDrinks.name")}
          </Text>
          <TextInput
            className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
            value={name}
            onChangeText={setName}
            placeholder={t("customDrinks.namePlaceholder")}
            placeholderTextColor="#6b7280"
            accessibilityLabel={t("customDrinks.name")}
          />

          <View className="flex-row mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-gray-400 text-sm mb-2">
                {t("customDrinks.abv")} (%)
              </Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 text-base"
                value={abv}
                onChangeText={setAbv}
                keyboardType="numeric"
                placeholder="16.5"
                placeholderTextColor="#6b7280"
                accessibilityLabel={t("customDrinks.abv")}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-sm mb-2">
                {t("customDrinks.volume")} (ml)
              </Text>
              <TextInput
                className="bg-gray-800 text-white rounded-xl px-4 py-3 text-base"
                value={volume}
                onChangeText={setVolume}
                keyboardType="numeric"
                placeholder="360"
                placeholderTextColor="#6b7280"
                accessibilityLabel={t("customDrinks.volume")}
              />
            </View>
          </View>

          <Text className="text-gray-400 text-sm mb-2">
            {t("customDrinks.price")}
          </Text>
          <TextInput
            className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 text-base"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#6b7280"
            accessibilityLabel={t("customDrinks.price")}
          />

          <TouchableOpacity
            className={`rounded-xl py-3 items-center mb-2 ${
              canSubmit ? "bg-green-600" : "bg-gray-700"
            }`}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={
              editingId ? t("customDrinks.save") : t("customDrinks.add")
            }
          >
            <Text
              className={`font-bold ${
                canSubmit ? "text-white" : "text-gray-500"
              }`}
            >
              {editingId ? t("customDrinks.save") : t("customDrinks.add")}
            </Text>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity
              className="rounded-xl py-2 items-center mb-2"
              onPress={resetForm}
              accessibilityRole="button"
              accessibilityLabel={t("common.cancel")}
            >
              <Text className="text-gray-400 text-sm">{t("common.cancel")}</Text>
            </TouchableOpacity>
          )}

          {drinks.length > 0 && (
            <View className="mt-3">
              <Text className="text-white text-base font-bold mb-2">
                {t("customDrinks.saved")}
              </Text>
              {drinks.map((drink) => (
                <View
                  key={drink.id}
                  className="flex-row items-center bg-gray-800 rounded-xl px-3 py-3 mb-2"
                >
                  <View className="flex-1">
                    <Text className="text-white text-sm font-semibold">
                      {drink.name}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-0.5">
                      {drink.volumeMl}ml · {drink.abv}% ·{" "}
                      {t("customDrinks.standardDrinksShort", {
                        count: standardDrinksOf(drink.volumeMl, drink.abv),
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="px-2 py-1"
                    onPress={() => handleEdit(drink)}
                    accessibilityRole="button"
                    accessibilityLabel={t("customDrinks.edit")}
                  >
                    <Ionicons name="pencil" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-2 py-1"
                    onPress={() => handleDelete(drink)}
                    accessibilityRole="button"
                    accessibilityLabel={t("customDrinks.delete")}
                  >
                    <Ionicons name="trash-outline" size={18} color="#f87171" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default CustomDrinkManagerModal;
