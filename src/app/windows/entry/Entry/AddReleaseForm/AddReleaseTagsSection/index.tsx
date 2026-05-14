import type { FC } from "react";

import styles from "./AddReleaseTagsSection.module.css";

import type { TagId, TagName, TagsById } from "@/types/tags";

type AddReleaseTagsSectionProps = {
  sortedTagEntries: [TagId, TagName][];
  selectedTagsById: TagsById;
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
};

const AddReleaseTagsSection: FC<AddReleaseTagsSectionProps> = ({
  sortedTagEntries,
  selectedTagsById,
  onAddTag,
  onRemoveTag,
}) => {
  const selectedTagEntries = Object.entries(selectedTagsById).sort(
    ([_a, tagA], [_b, tagB]) => tagA.localeCompare(tagB),
  );

  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>Tags</h2>

      {selectedTagEntries.length > 0 && (
        <ul className={styles.selectedList} aria-label="Selected tags">
          {selectedTagEntries.map(([tagId, tag]) => (
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
          key={selectedTagEntries.map(([id]) => id).join("|")}
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
          {sortedTagEntries.map(
            ([tagId, tag]) =>
              selectedTagsById[tagId] === undefined && (
                <option key={tagId} value={tagId}>
                  {tag}
                </option>
              ),
          )}
        </select>
      </div>
    </div>
  );
};

export default AddReleaseTagsSection;
