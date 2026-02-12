'use client';

import Image from "next/image";
import { videoDataset } from "../data/videos";
import { VideoCard } from "./VideoCard";

export function VideoFeed() {
  return (
    <>
      <section className="flex gap-2 overflow-x-auto pb-1">
        {videoDataset.categories.map(({ category }) => (
          <button
            key={category.slug}
            className="flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100"
          >
            <div className="relative h-5 w-5 overflow-hidden rounded-full bg-neutral-800">
              <Image
                src={category.iconUrl}
                alt={category.name}
                fill
                sizes="20px"
              />
            </div>
            <span>{category.name}</span>
          </button>
        ))}
      </section>

      <div className="flex flex-col gap-8">
        {videoDataset.categories.map(({ category, contents }) => (
          <section key={category.slug} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{category.name}</h2>
              <span className="text-xs text-neutral-500">
                {contents.length} videos
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {contents.map((video) => (
                <VideoCard
                  key={video.slug}
                  video={video}
                  category={category}
                  allCategoryVideos={contents}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

