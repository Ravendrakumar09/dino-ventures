'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { CategoryWithContents, VideoItem } from "../data/videos";

export type PlayerMode = "hidden" | "full" | "mini";

interface PlayerState {
  currentVideo: VideoItem | null;
  currentCategory: CategoryWithContents | null;
  isPlaying: boolean;
  mode: PlayerMode;
}

interface PlayerContextValue extends PlayerState {
  playVideo: (video: VideoItem, category: CategoryWithContents) => void;
  togglePlay: () => void;
  setMode: (mode: PlayerMode) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentVideo: null,
    currentCategory: null,
    isPlaying: false,
    mode: "hidden",
  });

  const playVideo = useCallback(
    (video: VideoItem, category: CategoryWithContents) => {
      setState({
        currentVideo: video,
        currentCategory: category,
        isPlaying: true,
        mode: "full",
      });
    },
    []
  );

  const togglePlay = useCallback(() => {
    setState((prev) =>
      prev.currentVideo ? { ...prev, isPlaying: !prev.isPlaying } : prev
    );
  }, []);

  const setMode = useCallback((mode: PlayerMode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  const value: PlayerContextValue = {
    ...state,
    playVideo,
    togglePlay,
    setMode,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return ctx;
}

