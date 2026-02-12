/**
 * Format seconds as mm:ss or hh:mm:ss
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Get YouTube video ID from embed URL (e.g. https://youtube.com/embed/VIDEO_ID) */
export function getYouTubeVideoId(mediaUrl: string): string {
  const match = mediaUrl.match(/(?:embed\/|v=)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : "";
}
