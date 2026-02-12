'use client';

import type { ReactNode } from "react";
import { PlayerProvider, usePlayer } from "../store/playerStore";

export function Providers({ children }: { children: ReactNode }) {
  return <PlayerProvider>{children}</PlayerProvider>;
}

export { usePlayer };


