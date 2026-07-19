import fs from "node:fs"; import path from "node:path";
const list = (dir, exts) => fs.readdirSync(dir, { withFileTypes: true }).filter((x) => x.isFile() && exts.includes(path.extname(x.name).toLowerCase())).map((x) => x.name).sort();
const videos = list("public/media/videos", [".mp4", ".webm"]).map((file, i) => ({ id: `v${String(i + 1).padStart(2, "0")}`, file: `/media/videos/${file}`, label: file }));
const radio = list("public/media/radio", [".mp3", ".wav", ".ogg"]).map((file, i) => ({ id: `r${String(i + 1).padStart(2, "0")}`, file: `/media/radio/${file}`, country: "UNKNOWN", city: "UNKNOWN", station: file, frequency: "—" }));
console.log(JSON.stringify({ videos, radio }, null, 2));
