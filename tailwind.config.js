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
      // 앱 실제 팔레트(다크 전용). 화면에서 쓰는 gray-900/800/green-* 유틸과
      // 동일한 값을 시맨틱 토큰으로 노출한다. 새 코드는 이 토큰을 우선 사용할 것.
      colors: {
        background: "#111827", // gray-900 — 화면 배경
        surface: "#1f2937", // gray-800 — 카드/입력 배경
        surfaceDeep: "#374151", // gray-700 — 구분선/보조 표면
        accent: "#22c55e", // green-500 — 주요 강조/CTA
        accentDeep: "#16a34a", // green-600 — 버튼 배경
        accentSoft: "#4ade80", // green-400 — 강조 텍스트
        textPrimary: "#ffffff",
        textSecondary: "#9ca3af", // gray-400
        textMuted: "#6b7280", // gray-500
        warning: "#f59e0b", // amber-500
        danger: "#ef4444", // red-500
      },
      borderRadius: {
        card: "12px", // 카드 표준 반경(rounded-xl과 동일)
      },
      fontFamily: {
        sans: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};
