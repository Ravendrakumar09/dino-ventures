import videoData from "./videos.json";

export type MediaType = "YOUTUBE" | "MP4";

export interface CategoryMeta {
  slug: string;
  name: string;
  iconUrl: string;
}

export interface VideoItem {
  title: string;
  mediaUrl: string;
  mediaType: MediaType;
  thumbnailUrl: string;
  slug: string;
}

export interface CategoryWithContents {
  category: CategoryMeta;
  contents: VideoItem[];
}

export interface VideoDataset {
  categories: CategoryWithContents[];
}

export const videoDataset: VideoDataset = videoData as VideoDataset;
