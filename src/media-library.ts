export type VideoItem = { id: string; file: string; title?: string; label?: string };
export type RadioItem = { id: string; file: string; country: string; city: string; station: string; frequency?: string; type?: string };

export class MediaLibrary {
  static async load() {
    const base = window.location.pathname.startsWith("/radio2") ? "/radio2" : "";
    const bust = `?v=${Date.now()}`;
    const [videos, radios] = await Promise.all([
      fetch(`${base}/data/videos.json${bust}`).then((response) => {
        if (!response.ok) throw new Error("videos.json을 읽지 못했습니다.");
        return response.json();
      }),
      fetch(`${base}/data/radio.json${bust}`).then((response) => {
        if (!response.ok) throw new Error("radio.json을 읽지 못했습니다.");
        return response.json();
      }),
    ]);

    return {
      videos: this.validVideos(videos).map((item) => ({ ...item, file: `${base}${item.file}` })),
      radios: this.validRadios(radios).map((item) => ({ ...item, file: `${base}${item.file}` })),
    };
  }

  static validVideos(value: unknown): VideoItem[] {
    if (!Array.isArray(value)) throw new Error("videos.json 최상위 값은 배열이어야 합니다.");
    return value.filter((item): item is VideoItem => Boolean(item && typeof item.id === "string" && typeof item.file === "string"));
  }

  static validRadios(value: unknown): RadioItem[] {
    if (!Array.isArray(value)) throw new Error("radio.json 최상위 값은 배열이어야 합니다.");
    return value.filter((item): item is RadioItem => Boolean(item && typeof item.id === "string" && typeof item.file === "string" && typeof item.station === "string"));
  }
}
