import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("전시 화면과 입력 컨트롤이 빌드 소스에 포함된다", async () => {
  const [page, css, radio] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/data/radio.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /NOW RECEIVING/);
  assert.match(page, /ArrowUp/);
  assert.match(page, /ArrowDown/);
  assert.match(page, /ArrowLeft/);
  assert.match(page, /ArrowRight/);
  assert.match(page, /onEnded=\{\(\) => playVideo/);
  assert.match(css, /aspect-ratio:\s*854\/480/);
  assert.match(css, /grid-template-areas:\s*"radio video"/);

  const stations = JSON.parse(radio);
  assert.equal(stations.length, 5);
  assert.equal(stations[0].city, "MEXICO CITY");
  assert.equal(stations[0].station, "RADIO UNAM");
  assert.equal(stations[0].frequency, "96.1");
});
