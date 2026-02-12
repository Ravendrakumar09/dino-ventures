'use client';

import { useState } from "react";
import Image from "next/image";
import { FullPagePlayer } from "../components/FullPagePlayer";
import { videoDataset } from "../data/videos";
import { usePlayer } from "./providers";

export default function Home() {
  const { playVideo, currentVideo, mode } = usePlayer();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  const categoriesToShow = selectedCategorySlug
    ? videoDataset.categories.filter((c) => c.category.slug === selectedCategorySlug)
    : videoDataset.categories;

  const isMiniPlayerVisible = currentVideo != null && mode === "mini";

  return (
    <main className="h-screen overflow-y-auto overflow-x-hidden bg-background text-foreground">
      <div
        className="mx-auto flex min-h-full w-full max-w-[420px] flex-col gap-6 px-4 pt-4 transition-[padding] duration-200"
        style={{ paddingBottom: isMiniPlayerVisible ? 112 : 32 }}
      >
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Dino Ventures</h1>
            <p className="text-xs text-neutral-500">
              Learn AI, content, and income with short videos
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800/80 text-xs font-semibold text-neutral-300">
            DV
          </div>
        </header>

        <section className="flex gap-2 overflow-x-auto pb-1">
          {videoDataset.categories.map(({ category }) => {
            const isActive = selectedCategorySlug === category.slug;
            return (
            <button
              key={category.slug}
              type="button"
              onClick={() => setSelectedCategorySlug(isActive ? null : category.slug)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors ${
                isActive
                  ? "bg-neutral-100 text-neutral-900"
                  : "bg-neutral-900 text-neutral-100"
              }`}
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
          );
          })}
        </section>

        <div className="flex flex-col gap-8">
          {categoriesToShow.map(({ category, contents }) => (
            <section key={category.slug} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{category.name}</h2>
                <span className="text-xs text-neutral-500">
                  {contents.length} videos
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {contents.map((video) => (
                  <article
                    key={video.slug}
                    className="flex cursor-pointer flex-col gap-2 rounded-xl bg-neutral-950/60 pb-3 shadow-sm"
                    onClick={() => playVideo(video, { category, contents })}
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
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-semibold uppercase text-neutral-400">
                        {video.title
                          .replace(/\b(\w)\w+/g, "$1")
                          .replace(/\s/g, "")
                          .slice(0, 2)}
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
                          {video.title}
                        </h3>
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
                ))}
              </div>
            </section>
          ))}
        </div>

      {currentVideo && (mode === "full" || mode === "mini") && (
        <FullPagePlayer />
      )}
      </div>
    </main>
  );
}
