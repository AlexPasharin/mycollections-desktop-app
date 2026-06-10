import type { DbSource } from "@/db/db-source";

export type TagListItem = {
  tagId: string;
  tag: string;
};

export type FetchTags = (dbSource: DbSource) => Promise<TagListItem[]>;

export type TagId = string;
