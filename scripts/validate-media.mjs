import fs from "node:fs"; import path from "node:path";
let failed = false;
for (const [manifest, kind] of [["videos.json", "videos"], ["radio.json", "radio"]]) {
  const file = path.join("public", "data", manifest);
  try {
    const entries = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(entries)) throw new Error("최상위 값이 배열이 아닙니다");
    for (const [index, entry] of entries.entries()) {
      if (!entry.id || !entry.file) { console.error(`${manifest} ${index + 1}번 항목: id/file 누락`); failed = true; continue; }
      const local = path.join("public", entry.file.replace(/^\//, ""));
      if (!fs.existsSync(local)) console.warn(`[placeholder] ${kind}: ${local} 파일을 교체하세요`);
    }
    console.log(`${manifest}: ${entries.length}개 항목, JSON 정상`);
  } catch (error) { console.error(`${manifest}: ${error.message}`); failed = true; }
}
process.exitCode = failed ? 1 : 0;
