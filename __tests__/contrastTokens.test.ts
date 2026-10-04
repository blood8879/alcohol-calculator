/**
 * 7회차 — WCAG AA 명암비 회귀 방지 (명세서 §4.7 "텍스트 대비 4.5:1").
 * 1) tailwind.config.js 색 토큰의 텍스트 대비를 WCAG 상대 휘도 공식으로 검사한다.
 * 2) 흰 글씨가 올라가는 초록 채움에 대비 미달 클래스(green-500/600, emerald-600)가
 *    다시 쓰이지 않도록 app/·components/ 의 className 문자열을 검사한다.
 */
import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindConfig = require("../tailwind.config.js");
const colors: Record<string, string> = tailwindConfig.theme.extend.colors;

const WHITE = "#ffffff";
const RED_400 = "#f87171"; // 화면에서 경고/초과 텍스트로 쓰는 text-red-400
const AA_TEXT = 4.5;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

describe("WCAG contrast — tailwind color tokens", () => {
  it("luminance helper matches known reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio(WHITE, "#16a34a")).toBeCloseTo(3.3, 1);
  });

  it("defines accentButton as green-700", () => {
    expect(colors.accentButton.toLowerCase()).toBe("#15803d");
  });

  it("white text on accentButton meets AA", () => {
    expect(contrastRatio(WHITE, colors.accentButton)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(["textSecondary", "textMuted"])("%s meets AA on surface and background", (token) => {
    expect(contrastRatio(colors[token], colors.surface)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(colors[token], colors.background)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("accentSoft text meets AA on surface", () => {
    expect(contrastRatio(colors.accentSoft, colors.surface)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("danger text color (red-400) meets AA on surface", () => {
    expect(contrastRatio(RED_400, colors.surface)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

function collectTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectTsx(full));
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

describe("WCAG contrast — no white text on low-contrast green fills", () => {
  const root = path.resolve(__dirname, "..");
  const files = ["app", "components"].flatMap((d) => collectTsx(path.join(root, d)));
  // className="..." / className={`...`} / className={"..."} 리터럴 하나 단위로 검사.
  const classNameLiteral = /className=\{?\s*(["'`])([\s\S]*?)\1/g;
  const badFill = /(^|[\s"'`])bg-(green-500|green-600|emerald-600)(?![\w/-])/;
  const whiteText = /(^|[\s"'`])text-white(?![\w/-])/;

  it("scans a non-trivial number of files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("no className combines bg-green-500/600 or bg-emerald-600 with text-white", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      for (const match of src.matchAll(classNameLiteral)) {
        const literal = match[2];
        if (badFill.test(literal) && whiteText.test(literal)) {
          offenders.push(`${path.relative(root, file)}: ${literal.trim().slice(0, 120)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("WCAG contrast — recipe difficulty badges (white text)", () => {
  const root = path.resolve(__dirname, "..");
  // 뱃지 배경은 맵으로 분리돼 있어 className 스캔에 안 걸리므로 맵 값을 직접 검사한다.
  const TAILWIND_HEX: Record<string, string> = {
    "bg-accentButton": colors.accentButton,
    "bg-amber-500": "#f59e0b",
    "bg-amber-700": "#b45309",
    "bg-red-500": "#ef4444",
    "bg-red-700": "#b91c1c",
  };

  it.each(["components/RecipeCard.tsx", "components/RecipeDetail.tsx"])(
    "%s badge fills meet AA with white text",
    (file) => {
      const src = fs.readFileSync(path.join(root, file), "utf8");
      const fills = [...src.matchAll(/(easy|medium|hard): "(bg-[\w-]+)"/g)].map((m) => m[2]);
      expect(fills).toHaveLength(3);
      for (const fill of fills) {
        const hex = TAILWIND_HEX[fill];
        expect(hex).toBeDefined();
        expect(contrastRatio("#ffffff", hex)).toBeGreaterThanOrEqual(AA_TEXT);
      }
    }
  );
});

describe("WCAG contrast — confirm dialog destructive button (white text)", () => {
  // 12회차: 명세서 §2.5 파괴 버튼 #EF4444는 흰 글씨 3.76:1로 AA 미달 → red-700(#b91c1c, 6.47:1).
  it("uses red-700 fill and meets AA", () => {
    const src = fs.readFileSync(path.resolve(__dirname, "../components/ui/ConfirmDialog.tsx"), "utf8");
    expect(src).toMatch(/destructive \? "bg-red-700"/);
    expect(src).not.toMatch(/bg-red-500/);
    expect(contrastRatio(WHITE, "#b91c1c")).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(WHITE, "#ef4444")).toBeLessThan(AA_TEXT);
  });
});
