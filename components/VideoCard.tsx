'use client';

import Image from "next/image";
import type { CategoryMeta, VideoItem } from "../data/videos";
import { usePlayer } from "../app/providers";

interface VideoCardProps {
  video: VideoItem;
  category: CategoryMeta;
  allCategoryVideos: VideoItem[];
}

export function VideoCard({ video, category, allCategoryVideos }: VideoCardProps) {
  const { playVideo } = usePlayer();

  return (
    <article
      className="flex cursor-pointer flex-col gap-2 rounded-xl bg-neutral-950/60 pb-3 shadow-sm"
      onClick={() => playVideo(video, { category, contents: allCategoryVideos })}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-800">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-neutral-100">
          5:00
        </div>
      </div>
      <div className="flex gap-3 px-2">
        <div className="mt-1 h-8 w-8 shrink-0 rounded-full bg-neutral-800" />
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</h3>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <span>Dino Ventures</span>
            <span>•</span>
            <span>42K views</span>
            <span>•</span>
            <span>2 days ago</span>
          </div>
          <span className="mt-1 inline-flex w-fit items-center rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-200">
            {category.name}
          </span>
        </div>
      </div>
    </article>
  );
}
