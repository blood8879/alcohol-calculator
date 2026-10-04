import fs from "fs";
import path from "path";

// 실기기(Android) 점검에서 발견: react-native-modal은 onBackButtonPress가 없으면
// 하드웨어 뒤로가기로 시트가 닫히지 않는다. 모든 사용처가 뒤로가기를 처리하는지 고정한다.
function collectTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectTsx(full));
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

describe("react-native-modal sheets handle the Android back button", () => {
  const root = path.resolve(__dirname, "..");
  const files = ["app", "components"]
    .flatMap((d) => collectTsx(path.join(root, d)))
    .filter((file) => /from ["']react-native-modal["']/.test(fs.readFileSync(file, "utf8")));

  it("finds the sheets", () => {
    expect(files.length).toBeGreaterThan(3);
  });

  it.each(files.map((file) => [path.relative(root, file), file]))(
    "%s passes onBackButtonPress to every <Modal>",
    (_name, file) => {
      const src = fs.readFileSync(file, "utf8");
      const modalCount = (src.match(/<Modal\b/g) ?? []).length;
      const backCount = (src.match(/onBackButtonPress=/g) ?? []).length;
      expect(backCount).toBeGreaterThanOrEqual(modalCount);
    }
  );
});
