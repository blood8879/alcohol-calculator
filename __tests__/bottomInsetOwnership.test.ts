import fs from "fs";
import path from "path";

// 실기기(Android) 점검에서 발견: 전면 광고를 닫으면 하단 인셋이 다시 잡히는데,
// 탭바·화면 SafeAreaView·세션 하단 바가 각자 하단 여백을 더해 탭바 아래에 빈 띠가 생겼다.
// 하단 인셋은 루트 광고 슬롯(app/_layout.tsx) 한 곳만 처리한다는 규칙을 고정한다.
const root = path.resolve(__dirname, "..");

function collectTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectTsx(full));
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

describe("bottom safe-area inset has a single owner (root ad slot)", () => {
  const screens = collectTsx(path.join(root, "app")).filter(
    (file) => path.relative(root, file) !== path.join("app", "_layout.tsx")
  );

  it("root layout pads the ad slot with the bottom inset", () => {
    const src = fs.readFileSync(path.join(root, "app", "_layout.tsx"), "utf8");
    expect(src).toMatch(/paddingBottom:\s*insets\.bottom/);
  });

  it("tab bar does not add its own bottom inset", () => {
    const src = fs.readFileSync(path.join(root, "app", "(tabs)", "_layout.tsx"), "utf8");
    expect(src).toMatch(/safeAreaInsets=\{\{\s*bottom:\s*0\s*\}\}/);
  });

  it.each(screens.map((file) => [path.relative(root, file), file]))(
    "%s: SafeAreaView excludes the bottom edge and no screen pads insets.bottom",
    (_name, file) => {
      const src = fs.readFileSync(file, "utf8");
      for (const match of src.matchAll(/<SafeAreaView\b[^>]*>/g)) {
        expect(match[0]).toMatch(/edges=\{\[/);
        expect(match[0]).not.toMatch(/"bottom"/);
      }
      expect(src).not.toMatch(/insets\.bottom/);
    }
  );
});
