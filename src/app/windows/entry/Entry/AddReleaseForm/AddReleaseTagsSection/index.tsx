import type { FC } from "react";

import styles from "./AddReleaseTagsSection.module.css";

import type { TagListItem } from "@/types/tags";

type AddReleaseTagsSectionProps = {
  tags: TagListItem[];
  selectedTags: Record<string, string>;
  onAddTag: (tagId: string, tag: string) => void;
  onRemoveTag: (tagId: string) => void;
};

const AddReleaseTagsSection: FC<AddReleaseTagsSectionProps> = ({
  tags,
  selectedTags,
  onAddTag,
  onRemoveTag,
}) => {
  const selectedSet = new Set(Object.keys(selectedTags));
  const availableTags = tags.filter((t) => !selectedSet.has(t.tagId));
  const selectedEntries = Object.entries(selectedTags);

  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>Tags</h2>

      {selectedEntries.length > 0 ? (
        <ul className={styles.selectedList} aria-label="Selected tags">
          {selectedEntries.map(([tagId, tag]) => (
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
      ) : null}

      {availableTags.length > 0 ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="add-release-tag-select">
            Add tag
          </label>
          <select
            id="add-release-tag-select"
            key={selectedEntries.map(([id]) => id).join("|")}
            className={styles.select}
            defaultValue=""
            onChange={(e) => {
              const { value } = e.target;

              if (value) {
                const picked = tags.find((t) => t.tagId === value);

                if (picked) {
                  onAddTag(picked.tagId, picked.tag);
                }
              }
            }}
          >
            <option value="">Choose a tag…</option>
            {availableTags.map((t) => (
              <option key={t.tagId} value={t.tagId}>
                {t.tag}
              </option>
            ))}
          </select>
        </div>
      ) : selectedEntries.length > 0 ? (
        <p className={styles.emptyHint}>All available tags are selected.</p>
      ) : null}
    </div>
  );
};

export default AddReleaseTagsSection;
