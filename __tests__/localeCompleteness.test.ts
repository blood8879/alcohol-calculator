import fs from "fs";
import path from "path";

// 스페인어 스토어 등록을 준비하며 발견: es/ja/zh에 개인정보 선택 키가 빠져 영어로 노출됐고,
// 계산기 시트·레시피 상세·가이드 패널은 `startsWith("ko") ? 한국어 : 영어`로 하드코딩돼
// es/ja/zh 사용자에게 영어가 섞여 보였다. 모든 언어 키를 ko와 맞추고 화면 코드의 언어 분기를 금지한다.
const root = path.resolve(__dirname, "..");
const LANGUAGES = ["en", "es", "ja", "zh"] as const;

type Json = { [key: string]: unknown };

const flattenKeys = (node: Json, prefix = ""): string[] =>
  Object.entries(node).flatMap(([key, value]) =>
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? flattenKeys(value as Json, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );

const loadLocale = (lang: string): Json =>
  JSON.parse(fs.readFileSync(path.join(root, "locales", `${lang}.json`), "utf8")) as Json;

function collectSources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectSources(full));
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

describe("locale completeness", () => {
  const koKeys = new Set(flattenKeys(loadLocale("ko")));

  it.each(LANGUAGES)("%s has exactly the same keys as ko", (lang) => {
    const keys = new Set(flattenKeys(loadLocale(lang)));
    expect([...koKeys].filter((key) => !keys.has(key))).toEqual([]);
    expect([...keys].filter((key) => !koKeys.has(key))).toEqual([]);
  });

  const sources = [
    ...collectSources(path.join(root, "app")),
    ...collectSources(path.join(root, "components")),
  ];

  it.each(sources.map((file) => [path.relative(root, file), file]))(
    "%s: UI text is not branched on the language code",
    (_name, file) => {
      const src = fs.readFileSync(file, "utf8");
      expect(src).not.toMatch(/language\.startsWith\(\s*["']ko["']\s*\)/);
      expect(src).not.toMatch(/\bisKorean\s*\?/);
    }
  );
});
