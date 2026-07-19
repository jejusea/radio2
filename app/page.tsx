"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG } from "../src/config";
import { Diagnostics } from "../src/diagnostics";
import { MediaLibrary, type RadioItem, type VideoItem } from "../src/media-library";

const EMPTY_RADIO: RadioItem = { id: "--", file: "", country: "NO SIGNAL", city: "—", station: "STANDBY", frequency: "---" };

function wrap(index: number, length: number) { return length ? (index + length) % length : 0; }
function wait(ms: number) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const diagnostics = useRef(new Diagnostics());
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [radios, setRadios] = useState<RadioItem[]>([]);
  const [videoIndex, setVideoIndex] = useState(0);
  const [radioIndex, setRadioIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [tuning, setTuning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [wakeLock, setWakeLock] = useState(false);
  const [debug, setDebug] = useState(false);
  const video = videos[videoIndex];
  const radio = radios[radioIndex] ?? EMPTY_RADIO;

  useEffect(() => {
    MediaLibrary.load().then(({ videos, radios }) => { setVideos(videos); setRadios(radios); }).catch((error) => diagnostics.current.error(String(error)));
  }, []);

  const playVideo = useCallback(async (index: number) => {
    if (!videos.length || transitioning) return;
    setTransitioning(true);
    diagnostics.current.input("VIDEO");
    const el = videoRef.current;
    if (el) { el.volume = 0; el.pause(); }
    await wait(CONFIG.videoTransitionMs);
    setVideoIndex(wrap(index, videos.length));
    await wait(40);
    if (el) { el.currentTime = 0; el.volume = CONFIG.videoVolume; await el.play().catch(() => diagnostics.current.error(`video unavailable: ${videos[wrap(index, videos.length)]?.file}`)); }
    setTransitioning(false);
  }, [videos, transitioning]);

  const playRadio = useCallback(async (index: number) => {
    if (!radios.length || tuning) return;
    setTuning(true);
    diagnostics.current.input("RADIO");
    const el = audioRef.current;
    if (el) { el.volume = 0; el.pause(); }
    await wait(CONFIG.tuningMs);
    const next = wrap(index, radios.length);
    setRadioIndex(next);
    await wait(30);
    if (el) {
      const duration = Number.isFinite(el.duration) ? el.duration : 0;
      el.currentTime = duration > CONFIG.minimumRadioRemaining ? Math.random() * (duration - CONFIG.minimumRadioRemaining) : 0;
      el.volume = CONFIG.radioVolume;
      await el.play().catch(() => diagnostics.current.error(`radio unavailable: ${radios[next]?.file}`));
    }
    setTuning(false);
  }, [radios, tuning]);

  const start = useCallback(async () => {
    setStarted(true);
    await videoRef.current?.play().catch(() => undefined);
    await audioRef.current?.play().catch(() => undefined);
    if (CONFIG.useWakeLock && "wakeLock" in navigator) {
      try { await navigator.wakeLock.request("screen"); setWakeLock(true); } catch { setWakeLock(false); }
    }
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!started || event.repeat) return;
      const map: Record<string, () => void> = {
        ArrowUp: () => playVideo(videoIndex - 1), ArrowDown: () => playVideo(videoIndex + 1),
        ArrowLeft: () => playRadio(radioIndex - 1), ArrowRight: () => playRadio(radioIndex + 1),
      };
      if (map[event.key]) { event.preventDefault(); map[event.key](); }
      if (event.key.toLowerCase() === "d") setDebug((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, videoIndex, radioIndex, playVideo, playRadio]);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  return (
    <main className={`receiver ${started ? "is-live" : "is-standby"}`} onContextMenu={(e) => e.preventDefault()}>
      <section className="chassis">
        <div className={`screen ${transitioning ? "whiteout" : ""}`}>
          <video ref={videoRef} key={video?.file} src={video?.file} muted={false} playsInline preload="metadata" onEnded={() => playVideo(videoIndex + 1)} onError={() => diagnostics.current.skip(video?.file ?? "missing video")} />
          <div className={`fallback scene-${videoIndex % 5}`}><span>{String(videoIndex + 1).padStart(2, "0")}</span></div>
        </div>

        <aside className="radio-panel" aria-live="polite">
          {tuning ? <div className="tuning"><b>TUNING</b><span>··· ·−· ··</span></div> : <>
            <p>NOW RECEIVING</p>
            <h1>{radio.city}, {radio.country}</h1>
            <strong>{radio.station}</strong>
            <div className="frequency">{radio.frequency ?? radio.type} FM</div>
          </>}
        </aside>
        <div className="video-info">{video?.label ?? video?.title ?? "VIDEO INFO"}</div>
        <div className="light-lines" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      </section>

      {started && CONFIG.showControls && <nav className="controls" aria-label="전시 조작">
        <div className="radio-controls"><button onClick={() => playRadio(radioIndex - 1)} aria-label="이전 라디오">LIGHT</button><button onClick={() => playRadio(radioIndex + 1)} aria-label="다음 라디오">DIAL</button></div>
        <button className="video-control" onClick={() => playVideo(videoIndex + 1)} aria-label="다음 영상">TOGGLE</button>
      </nav>}

      <audio ref={audioRef} key={radio.file} src={radio.file} preload="metadata" onEnded={() => playRadio(radioIndex + 1)} onError={() => diagnostics.current.skip(radio.file || "missing radio")} />
      {!started && <button className="start" onClick={start}>START</button>}
      {debug && <pre className="diagnostics">{JSON.stringify({ video: `${videoIndex + 1}/${videos.length}`, videoFile: video?.file, radio: `${radioIndex + 1}/${radios.length}`, radioFile: radio.file, fullscreen, wakeLock, transitioning, tuning }, null, 2)}</pre>}
    </main>
  );
}
