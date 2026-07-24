import { type FC } from "react";

import styles from "./EntryDetailsPanel.module.css";

import api from "../../api";

import CopyTextCta from "@/app/components/CopyTextCta";
import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { DbSource } from "@/db/db-source";
import type { EntryByIdResult, RelatedEntryItem } from "@/types/entries";
import { formatEntryArtistsLabel } from "@/utils/artist";
import { formatGeneralizedDate } from "@/utils/date";

type EntryDetailsPanelProps = {
  entry: EntryByIdResult;
  primaryDbSource: DbSource;
};

const EntryDetailsPanel: FC<EntryDetailsPanelProps> = ({
  entry,
  primaryDbSource,
}) => {
  const {
    types,
    altNames,
    originalReleaseDate,
    discogsUrl,
    partOfQueenCollection,
    relationToQueen,
    tags,
    comment,
    parentEntries,
    childEntries,
  } = entry;

  return (
    <div className={styles.entryPanel}>
      <div className={styles.field}>
        {types.length > 0 ? (
          <ul className={styles.typesList}>
            {types.map(({ entryTypeId, name }) => (
              <li key={entryTypeId} className={styles.typesListItem}>
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.italicNote}>
            (Types of this entry are not known, please update types of this
            entry in the database)
          </p>
        )}
      </div>

      {altNames.length > 0 && (
        <p className={styles.field}>
          <span className={styles.fieldLabel}>Also known as: </span>
          {altNames.map(({ name }) => name).join(", ")}
        </p>
      )}

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Original release date: </span>
        {originalReleaseDate === null ? (
          "(Unknown)"
        ) : "error" in originalReleaseDate ? (
          <DataWithErrorDisplay
            value={originalReleaseDate.value}
            error={originalReleaseDate.error}
          />
        ) : (
          formatGeneralizedDate(originalReleaseDate)
        )}
      </div>

      {discogsUrl && (
        <p className={styles.field}>
          <span className={styles.fieldLabel}>Discogs url: </span>
          <a href={discogsUrl} target="_blank" rel="noreferrer">
            {discogsUrl}
          </a>
        </p>
      )}

      {partOfQueenCollection && (
        <p className={styles.field}>
          <span className={styles.fieldLabelItalic}>
            Part of Queen collection
          </span>
        </p>
      )}

      {relationToQueen && (
        <p className={styles.field}>
          <span className={styles.fieldLabel}>Relation to Queen: </span>
          {relationToQueen}
        </p>
      )}

      {tags.length > 0 && (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Tags:</span>
          <ul className={styles.typesList}>
            {tags.map(({ tagId, tag }) => (
              <li key={tagId} className={styles.tagsListItem}>
                {tag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {comment && (
        <div>
          <p className={styles.comment}>{comment}</p>
        </div>
      )}

      <RelatedEntries
        parentEntries={parentEntries}
        childEntries={childEntries}
        primaryDbSource={primaryDbSource}
      />

      <CopyTextCta
        text={entry.entryId}
        label="copy entry's id"
        successMessage="Entry id copied to clipboard"
        errorMessage="Could not copy entry id to clipboard"
      />
    </div>
  );
};

export default EntryDetailsPanel;

type RelatedEntriesProps = {
  parentEntries: RelatedEntryItem[];
  childEntries: RelatedEntryItem[];
  primaryDbSource: DbSource;
};

const RelatedEntries: FC<RelatedEntriesProps> = ({
  parentEntries,
  childEntries,
  primaryDbSource,
}) => {
  if (parentEntries.length === 0 && childEntries.length === 0) {
    return null;
  }

  const openRelatedEntryWindow = (relatedEntry: RelatedEntryItem) => {
    api.openNewEntryWindow({
      entryId: relatedEntry.entryId,
      source: primaryDbSource,
    });
  };

  return (
    <div className="mt-[0.85rem] flex flex-col gap-[0.65rem] border-t border-[#e0dcf5] pt-[0.85rem] text-[0.92em]">
      {parentEntries.length > 0 && (
        <RelatedEntriesSection
          label="Parent entries:"
          entries={parentEntries}
          onEntrySelect={openRelatedEntryWindow}
        />
      )}
      {childEntries.length > 0 && (
        <RelatedEntriesSection
          label="Child entries:"
          entries={childEntries}
          onEntrySelect={openRelatedEntryWindow}
        />
      )}
    </div>
  );
};

type RelatedEntriesSectionProps = {
  label: string;
  entries: RelatedEntryItem[];
  onEntrySelect: (entry: RelatedEntryItem) => void;
};

const RelatedEntriesSection: FC<RelatedEntriesSectionProps> = ({
  label,
  entries,
  onEntrySelect,
}) => (
  <div>
    <span className="mb-1 block font-semibold">{label}</span>
    <ul className="m-0 list-none p-0 [&>li+li]:mt-[0.2rem]">
      {entries.map((relatedEntry) => (
        <li key={relatedEntry.entryId}>
          <button
            type="button"
            className="m-0 cursor-pointer border-none bg-transparent p-0 text-left font-[inherit] text-[#1a5fb4] text-[inherit] underline hover:text-[#0d3d82] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a5fb4]"
            onClick={() => onEntrySelect(relatedEntry)}
          >
            {formatRelatedEntryLabel(relatedEntry)}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

const formatRelatedEntryLabel = (relatedEntry: RelatedEntryItem): string =>
  `${formatEntryArtistsLabel(relatedEntry.artists)} - ${relatedEntry.mainName}`;
