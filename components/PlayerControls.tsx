'use client';

import { formatTime } from "../utils/formatTime";

interface PlayerControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onMinimize?: () => void;
}

export function PlayerControls({
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  onSkipBack,
  onSkipForward,
  onMinimize,
}: PlayerControlsProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-black/90 to-transparent p-4 pt-8">
      <input
        type="range"
        min={0}
        max={Math.max(duration, 1)}
        value={currentTime}
        step={0.1}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPlayPause}
            className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 touch-manipulation"
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
            onClick={onSkipBack}
            className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full bg-white/20 text-xs font-semibold transition hover:bg-white/30 touch-manipulation"
            aria-label="Back 10 seconds"
          >
            -10
          </button>
          <button
            type="button"
            onClick={onSkipForward}
            className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full bg-white/20 text-xs font-semibold transition hover:bg-white/30 touch-manipulation"
            aria-label="Forward 10 seconds"
          >
            +10
          </button>
          {onMinimize && (
            <button
              type="button"
              onClick={onMinimize}
              className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30 touch-manipulation"
              aria-label="Minimize to small player"
              title="Small player"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
        <span className="text-sm text-white/90 tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
