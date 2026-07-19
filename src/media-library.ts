export type VideoItem = { id: string; file: string; title?: string; label?: string };
export type RadioItem = { id: string; file: string; country: string; city: string; station: string; frequency?: string; type?: string };

export class MediaLibrary {
  static async load() {
    const bust = `?v=${Date.now()}`;
    const [videos, radios] = await Promise.all([
      fetch(`/data/videos.json${bust}`).then((r) => { if (!r.ok) throw new Error("videos.json을 읽지 못했습니다"); return r.json(); }),
      fetch(`/data/radio.json${bust}`).then((r) => { if (!r.ok) throw new Error("radio.json을 읽지 못했습니다"); return r.json(); }),
    ]);
    return { videos: this.validVideos(videos), radios: this.validRadios(radios) };
  }
  static validVideos(value: unknown): VideoItem[] {
    if (!Array.isArray(value)) throw new Error("videos.json 최상위 값은 배열이어야 합니다");
    return value.filter((item): item is VideoItem => Boolean(item && typeof item.id === "string" && typeof item.file === "string"));
  }
  static validRadios(value: unknown): RadioItem[] {
    if (!Array.isArray(value)) throw new Error("radio.json 최상위 값은 배열이어야 합니다");
    return value.filter((item): item is RadioItem => Boolean(item && typeof item.id === "string" && typeof item.file === "string" && typeof item.station === "string"));
  }
}
