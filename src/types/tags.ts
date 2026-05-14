export type TagListItem = {
  tagId: string;
  tag: string;
};

export type TagId = string;
export type TagName = string;

export type TagsById = Record<TagId, TagName>;
