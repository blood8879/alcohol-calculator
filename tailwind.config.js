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
        primary: "#4CAF50", // 주 색상 (PRD에서 정의)
        background: "#f5f5f5", // 배경색
        card: "#fff", // 카드 배경
        text: "#333", // 텍스트
        result: "#f0f0f0", // 결과 배경
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
