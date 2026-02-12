'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePlayer } from "../app/providers";
import type { VideoItem } from "../data/videos";
import { getYouTubeVideoId } from "../utils/formatTime";
import { PlayerControls } from "./PlayerControls";

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: { videoId: string; events?: { onReady?: (e: { target: YTPlayer }) => void } }
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number; CUED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  loadVideoById: (videoId: string) => void;
  destroy: () => void;
}

const YT_PLAYING = 1;
const YT_PAUSED = 2;

export function FullPagePlayer() {
  const { currentVideo, currentCategory, mode, setMode, playVideo, togglePlay, isPlaying } = usePlayer();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [listOpen, setListOpen] = useState(true);
  const dragStartRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!currentVideo) return null;

  const videoId =
    currentVideo.mediaType === "YOUTUBE" ? getYouTubeVideoId(currentVideo.mediaUrl) : "";

  const relatedVideos: VideoItem[] = currentCategory
    ? currentCategory.contents.filter((v) => v.slug !== currentVideo.slug)
    : [];

  const syncPlayState = useCallback(() => {
    const p = playerRef.current;
    if (!p || typeof p.getPlayerState !== "function") return;
    const state = p.getPlayerState();
    if (state === YT_PLAYING) setCurrentTime(p.getCurrentTime());
    if (state === YT_PLAYING || state === YT_PAUSED) setDuration(p.getDuration());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !videoId) return;
    if (window.YT?.Player) {
      if (!containerRef.current) return;
      const el = document.createElement("div");
      el.id = "yt-player-" + videoId;
      Object.assign(el.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      });
      containerRef.current.appendChild(el);
      const player = new window.YT.Player(el.id, {
        videoId,
        events: {
          onReady(ev: { target: YTPlayer }) {
            playerRef.current = ev.target;
            ev.target.playVideo();
            setDuration(ev.target.getDuration());
          },
        },
      });
      return () => {
        if (playerRef.current?.destroy) playerRef.current.destroy();
        playerRef.current = null;
        if (containerRef.current?.contains(el)) containerRef.current.removeChild(el);
      };
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(tag, firstScript);
    window.onYouTubeIframeAPIReady = () => {
      if (!containerRef.current) return;
      const el = document.createElement("div");
      el.id = "yt-player-" + videoId;
      Object.assign(el.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      });
      containerRef.current.appendChild(el);
      const player = new window.YT!.Player(el.id, {
        videoId,
        events: {
          onReady(ev: { target: YTPlayer }) {
            playerRef.current = ev.target;
            ev.target.playVideo();
            setDuration(ev.target.getDuration());
          },
        },
      });
    };
    return () => {
      window.onYouTubeIframeAPIReady = undefined;
      if (playerRef.current?.destroy) playerRef.current.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    if (currentVideo?.mediaType !== "YOUTUBE" || !playerRef.current) return;
    const id = getYouTubeVideoId(currentVideo.mediaUrl);
    if (playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(id);
      playerRef.current.playVideo();
    }
  }, [currentVideo?.slug, currentVideo?.mediaUrl, currentVideo?.mediaType]);

  useEffect(() => {
    if (currentVideo?.mediaType !== "YOUTUBE") return;
    pollRef.current = setInterval(syncPlayState, 500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [currentVideo?.mediaType, syncPlayState]);

  const handlePlayPause = useCallback(() => {
    if (currentVideo?.mediaType === "YOUTUBE" && playerRef.current) {
      const p = playerRef.current;
      if (typeof p.getPlayerState === "function") {
        const state = p.getPlayerState();
        if (state === YT_PLAYING) p.pauseVideo();
        else p.playVideo();
      }
    }
    togglePlay();
  }, [currentVideo?.mediaType, togglePlay]);

  const handleSeek = useCallback(
    (time: number) => {
      if (currentVideo?.mediaType === "YOUTUBE" && playerRef.current?.seekTo) {
        playerRef.current.seekTo(time, true);
        setCurrentTime(time);
      }
    },
    [currentVideo?.mediaType]
  );

  const handleSkipBack = useCallback(() => {
    const t = Math.max(0, currentTime - 10);
    handleSeek(t);
  }, [currentTime, handleSeek]);

  const handleSkipForward = useCallback(() => {
    const t = Math.min(duration, currentTime + 10);
    handleSeek(t);
  }, [currentTime, duration, handleSeek]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragStartRef.current = e.clientY;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    []
  );
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    const dy = e.clientY - dragStartRef.current;
    if (dy > 0) setDragY(Math.min(dy, 300));
  }, []);
  const onPointerUp = useCallback(() => {
    if (dragY > 120) setMode("mini");
    setDragY(0);
  }, [dragY, setMode]);

  const isMini = mode === "mini";

  return (
    <div
      className="fixed z-40 flex flex-col bg-black text-white"
      style={
        isMini
          ? { bottom: 0, left: 0, right: 0, height: 100, maxWidth: 420, margin: "0 auto" }
          : {
              inset: 0,
              transform: `translateY(${dragY}px)`,
              transition: dragY === 0 ? "transform 0.2s" : "none",
            }
      }
    >
      <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden">
        {isMini ? (
          <>
            {currentVideo.mediaType === "YOUTUBE" && (
              <div
                ref={containerRef}
                className="absolute left-2 top-2 h-[84px] w-[150px] shrink-0 overflow-hidden rounded md:h-[72px] md:w-[128px]"
              />
            )}
            {currentVideo.mediaType !== "YOUTUBE" && (
              <div className="absolute left-2 top-2 h-[84px] w-[150px] overflow-hidden rounded md:h-[72px] md:w-[128px]">
                <video
                  src={currentVideo.mediaUrl}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                  controls
                />
              </div>
            )}
          <div
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 pl-[158px] pr-2 md:pl-[136px]"
            onClick={() => setMode("full")}
          >
            <p className="min-w-0 flex-1 truncate text-sm font-medium">{currentVideo.title}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMode("full");
              }}
              className="flex h-11 w-11 min-w-[44px] shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 touch-manipulation"
              aria-label="Expand to full screen"
              title="Full screen"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="flex h-11 w-11 min-w-[44px] shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 touch-manipulation"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMode("hidden");
              }}
              className="flex h-11 w-11 min-w-[44px] shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 touch-manipulation"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </>
        ) : (
          <>
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className="relative z-10 flex min-h-14 shrink-0 cursor-grab touch-none items-center justify-between gap-2 bg-black/95 px-3 py-2 active:cursor-grabbing"
            >
              <h2 className="min-w-0 flex-1 truncate pr-2 text-sm font-medium">{currentVideo.title}</h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMode("mini");
                }}
                className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 touch-manipulation"
                aria-label="Minimize to small player"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMode("hidden");
                }}
                className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 touch-manipulation"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="player-reveal-list flex min-h-0 flex-1 flex-col overflow-x-hidden">
              <section className="relative h-[55vh] min-h-[280px] shrink-0">
                {currentVideo.mediaType === "YOUTUBE" && (
                  <div ref={containerRef} className="absolute inset-0 yt-player-full" />
                )}
                {currentVideo.mediaType !== "YOUTUBE" && (
                  <div className="absolute inset-0">
                    <video
                      src={currentVideo.mediaUrl}
                      className="h-full w-full object-cover"
                      autoPlay
                      playsInline
                      controls
                    />
                  </div>
                )}
                {currentVideo.mediaType === "YOUTUBE" && (
                  <PlayerControls
                    currentTime={currentTime}
                    duration={duration}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onSeek={handleSeek}
                    onSkipBack={handleSkipBack}
                    onSkipForward={handleSkipForward}
                    onMinimize={() => setMode("mini")}
                  />
                )}
              </section>

              <section
                className={`flex flex-col border-t border-white/10 bg-neutral-950/95 pt-1 ${listOpen ? "min-h-0 flex-1" : "shrink-0"}`}
              >
                <button
                  type="button"
                  onClick={() => setListOpen((o) => !o)}
                  className="flex shrink-0 items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5 active:bg-white/10"
                  aria-expanded={listOpen}
                  aria-label={listOpen ? "Close list" : "Open list"}
                >
                  <span className="text-sm font-medium text-white/90">
                    Up next · Same category
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                    {listOpen ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </button>
                {listOpen ? (
                <ul className="up-next-list min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-t border-white/10 pb-8 transition-opacity duration-200">
                  {relatedVideos.map((v) => (
                    <li key={v.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentCategory) {
                            playVideo(v, currentCategory);
                          }
                        }}
                        className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 active:bg-white/10"
                      >
                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                          <Image
                            src={v.thumbnailUrl}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/90">
                          {v.title}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                ) : null}
              </section>
            </div>
          </>
        )}
      </div>
      {!isMini && (
        <p className="absolute bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80">
          Drag down to minimize
        </p>
      )}
    </div>
  );
}
