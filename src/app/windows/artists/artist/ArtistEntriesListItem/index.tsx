import { type FC } from "react";

import styles from "./ArtistEntriesListItem.module.css";

import api from "../api";

import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesListItemProps = {
  entry: EntrySearchResult;
};

const ArtistEntriesListItem: FC<ArtistEntriesListItemProps> = ({ entry }) => {
  const { entryId, mainName, types, altNames } = entry;
  const typesJoined = types.length > 0 ? types.join(", ") : null;
  const altNamesJoined = altNames.length > 0 ? altNames.join(", ") : null;

  return (
    <li>
      <button
        className={styles.item}
        type="button"
        onClick={() => {
          api.openNewEntryWindow({ entryId });
        }}
      >
        <div>
          <span className={styles.mainName}>{mainName}</span>
          {typesJoined && <span> ({typesJoined})</span>}
        </div>
        {altNamesJoined && (
          <div className={styles.altNamesSection}>
            also known as: {altNamesJoined}
          </div>
        )}
      </button>
    </li>
  );
};

export default ArtistEntriesListItem;
