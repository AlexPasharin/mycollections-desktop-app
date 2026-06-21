import type { DbSource } from "@/db/db-source";

export type TagListItem = {
  tagId: string;
  tag: string;
};

export type FetchTags = (dbSource: DbSource) => Promise<TagListItem[]>;

export type TagId = string;

export type CreateTagInput = {
  tag: string;
  tagId?: string;
};

export type CreateTagResult = {
  tag: TagListItem;
  notifications: string[];
};

export type CreateTag = (
  input: CreateTagInput,
  dbSource: DbSource,
) => Promise<CreateTagResult>;

export type CreateTagsWindowParams = {
  source: DbSource;
};
