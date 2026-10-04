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
        accentDeep: "#16a34a", // green-600 — 비텍스트 채움(진행바·점·선택 테두리). 흰 글씨 3.30:1이라 텍스트 배경 금지
        accentButton: "#15803d", // green-700 — 흰 글씨/아이콘이 올라가는 초록 채움(버튼·선택 칩). 흰 글씨 5.02:1 (WCAG AA)
        accentSoft: "#4ade80", // green-400 — 강조 텍스트
        textPrimary: "#ffffff",
        textSecondary: "#9ca3af", // gray-400
        textMuted: "#8b93a1", // 힌트·시각 등 보조 텍스트. surface 4.74:1 · background 5.73:1 (WCAG AA). gray-500(#6b7280)은 3.04:1로 미달
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
