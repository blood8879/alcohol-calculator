/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#95D052", // 어두운 Inchworm
        secondary: "#243B37", // Gunmetal
        accent: "#E06427", // 어두운 Orange
        highlight: "#9A8BE6", // 어두운 Pale Violet
        background: "#F5F5F5", // 밝은 회색 배경
        metallic: "#C0C0C0", // 어두운 American Silver
        text: "#243B37", // 텍스트 - Gunmetal
        card: "#FAFAFA", // 카드 배경 - 약간 어두운 흰색
        result: "#EFEFEF", // 결과 배경 - 더 어두운 회색
      },
      borderRadius: {
        card: "16px",
      },
      fontFamily: {
        sans: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};
