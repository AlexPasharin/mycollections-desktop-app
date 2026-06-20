import type { FC } from "react";

import type { TagId, TagListItem } from "@/types/tags";

type AddTagsFormSectionProps = {
  tags: TagListItem[];
  selectedTagIds: Set<TagId>;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
};

const AddTagsFormSection: FC<AddTagsFormSectionProps> = ({
  tags,
  selectedTagIds,
  onAddTag,
  onRemoveTag,
}) => {
  const [selectedTags, availableTags] = tags.reduce<
    [TagListItem[], TagListItem[]]
  >(
    (acc, tag) => {
      const idx = selectedTagIds.has(tag.tagId) ? 0 : 1;
      acc[idx].push(tag);

      return acc;
    },
    [[], []],
  );

  return (
    <div className="mt-0 mb-[0.65rem]">
      <h2 className="mb-3 text-[1em] leading-[1.35] font-semibold">Tags</h2>

      {selectedTags.length > 0 && (
        <ul
          className="mb-3 flex list-none flex-wrap gap-[0.4rem] p-0"
          aria-label="Selected tags"
        >
          {selectedTags.map(({ tagId, tag }) => (
            <li
              key={tagId}
              className="inline-flex items-center gap-[0.35rem] rounded bg-black/6 px-2 py-1 text-[0.92em]"
            >
              <span>{tag}</span>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent px-[0.35rem] py-[0.1rem] text-[0.85em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
                onClick={() => {
                  onRemoveTag(tagId);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-[0.65rem] flex flex-col gap-[0.35rem]">
        <label
          className="text-[0.92em] font-semibold"
          htmlFor="add-release-tag-select"
        >
          Add tag
        </label>
        <select
          id="add-release-tag-select"
          className="box-border w-full max-w-96 px-2 py-[0.35rem] text-[1em]"
          defaultValue=""
          onChange={(e) => {
            const { value } = e.target;

            if (value) {
              onAddTag(value);
            }
          }}
        >
          <option value="">Choose a tag…</option>
          {availableTags.map(({ tagId, tag }) => (
            <option key={tagId} value={tagId}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddTagsFormSection;
