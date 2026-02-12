'use client';

import { usePlayer } from "../app/providers";

export function VideoPlayerOverlay() {
  const { currentVideo, mode, setMode } = usePlayer();

  if (!currentVideo || mode !== "full") return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/90 text-white">
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        <header className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-medium line-clamp-1">
            {currentVideo.title}
          </h2>
          <button
            className="rounded-full bg-white/10 px-3 py-1 text-xs"
            onClick={() => setMode("hidden")}
          >
            Close
          </button>
        </header>
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-xs text-neutral-300">
            Full-screen player UI will go here.
          </p>
        </div>
      </div>
    </div>
  );
}

