import React, { useRef, useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const ITEM_WIDTH = 56;
const ITEM_MARGIN = 8;
const TOTAL_DAYS = 30;

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const CalendarStrip = ({ selectedDate, onSelectDate }: CalendarStripProps) => {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const today = new Date();
  const DAY_NAMES = [t("time.sun"), t("time.mon"), t("time.tue"), t("time.wed"), t("time.thu"), t("time.fri"), t("time.sat")];

  const days: Date[] = [];
  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }

  useEffect(() => {
    const idx = days.findIndex((d) => isSameDay(d, selectedDate));
    if (idx >= 0 && scrollRef.current) {
      const offset = idx * (ITEM_WIDTH + ITEM_MARGIN);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: offset, animated: false });
      }, 100);
    }
  }, []);

  return (
    <View className="mb-4">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {days.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const dayName = DAY_NAMES[day.getDay()];
          const dayNum = day.getDate();

          return (
            <TouchableOpacity
              key={index}
              className={`w-14 h-20 items-center justify-center rounded-xl mr-2 ${
                isSelected ? "bg-green-500" : "bg-gray-800"
              }`}
              onPress={() => onSelectDate(day)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs ${
                  isSelected ? "text-white" : "text-gray-400"
                }`}
              >
                {dayName}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  isSelected ? "text-white" : "text-gray-400"
                }`}
              >
                {dayNum}
              </Text>
              {isToday && (
                <View
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? "bg-white" : "bg-green-500"
                  }`}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CalendarStrip;
