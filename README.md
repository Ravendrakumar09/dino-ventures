# Dino Ventures – Video Player App

A mobile-first video player application with a YouTube-style experience: scrollable feed, full-page player with custom controls, in-player related list, and drag-to-minimize mini-player.

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Deploy

```bash
npm run build
npm start
```

Deploy to Vercel, Netlify, or Cloudflare by connecting the repo; the build uses standard Next.js output.

## Feature List

### 1. Home Page – Video Feed
- **Layout:** Scrollable list of videos grouped by category (Social Media AI, AI Income, AI Essentials).
- **Video cards:** Thumbnail, title, duration badge (5:00), category badge.
- **Interactions:** Tap a card to open the full-page player. Category chips filter the feed.
- **Tech:** Next.js (React), TypeScript, Tailwind CSS.

### 2. Full-Page Video Player
- **Playback:** Auto-play on open (YouTube embed with `autoplay=1`).
- **Custom controls:**
  - Play / Pause
  - Skip backward (−10 s) and forward (+10 s)
  - Seekable progress bar
  - Current time / total duration (e.g. `1:23 / 5:00`)
- **Responsiveness:** Works on mobile and desktop; narrow column (max 420px) for a Shorts-like layout.
- **Format:** YouTube (embed); structure supports MP4 with native `<video>` and same controls.

### 3. In-Player Video List
- **Reveal:** “Up next · Same category” section at the bottom; tap to expand/collapse the list.
- **Filtering:** Only videos from the current video’s category.
- **Selection:** Tap a video to switch playback to it immediately and auto-play; list updates when category changes.
- **UX:** Smooth expand/collapse and scroll inside the list.

### 4. Drag-to-Minimize (Picture-in-App)
- **Gesture:** Drag the player header downward to minimize.
- **Docking:** Player shrinks into a bottom mini-player bar (video preview, title, play/pause, close).
- **Mini-player:** Small video preview (playback continues), title, play/pause, close button.
- **Persistence:** Mini-player stays visible while browsing the home feed; feed gets bottom padding so it stays scrollable.
- **Restore:** Tap the mini-player bar to return to full-screen.

## Project Structure

```
app/
  layout.tsx
  page.tsx          # Home feed + player overlay
  providers.tsx     # Player context wrapper
  globals.css
components/
  FullPagePlayer.tsx   # Full + mini player, controls, related list, drag
  PlayerControls.tsx   # Play/pause, ±10s, progress bar, time
  VideoFeed.tsx
  VideoPlayer.tsx
store/
  playerStore.tsx   # Global player state (current video, category, mode)
data/
  videos.json       # Dataset (categories + contents)
  videos.ts         # Types + export
utils/
  formatTime.ts     # mm:ss formatting, YouTube ID from URL
next.config.ts      # Image domains for thumbnails
```

## Dataset

Videos and categories are defined in `data/videos.json`. Each item has `title`, `mediaUrl` (YouTube embed URL), `mediaType`, `thumbnailUrl`, `slug`; each category has `slug`, `name`, `iconUrl`.

## Technical Notes

- **YouTube:** Custom controls use the [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) (loaded at runtime) for play, pause, seek, and time.
- **State:** React context in `store/playerStore.tsx` holds current video, category, play state, and mode (`hidden` | `full` | `mini`).
- **Styling:** Tailwind CSS; mobile-first with a 420px-wide main column.
