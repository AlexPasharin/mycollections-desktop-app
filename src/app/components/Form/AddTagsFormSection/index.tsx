import type { FC } from "react";

import styles from "./AddTagsFormSection.module.css";

import type { TagId, TagListItem, } from "@/types/tags";

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
  const [selectedTags, availableTags] = tags.reduce<[TagListItem[], TagListItem[]]>((acc, tag) => {
    const idx = selectedTagIds.has(tag.tagId) ? 0 : 1;
    acc[idx].push(tag);

    return acc;
  }, [[], []]);

  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>Tags</h2>

      {selectedTags.length > 0 && (
        <ul className={styles.selectedList} aria-label="Selected tags">
          {selectedTags.map(({ tagId, tag }) => (
            <li key={tagId} className={styles.selectedItem}>
              <span>{tag}</span>
              <button
                type="button"
                className={styles.removeTag}
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

      <div className={styles.field}>
        <label className={styles.label} htmlFor="add-release-tag-select">
          Add tag
        </label>
        <select
          id="add-release-tag-select"
          className={styles.select}
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
