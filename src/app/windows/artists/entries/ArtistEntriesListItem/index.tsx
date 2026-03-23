import { type FC } from "react";

import styles from "./ArtistEntriesListItem.module.css";

import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesListItemProps = {
  entry: EntrySearchResult;
};

const ArtistEntriesListItem: FC<ArtistEntriesListItemProps> = ({ entry }) => {
  const { mainName, types, altNames } = entry;
  const typesJoined = types.length > 0 ? types.join(", ") : null;
  const altNamesJoined = altNames.length > 0 ? altNames.join(", ") : null;

  return (
    <li className={styles.item}>
      <div>
        <span className={styles.mainName}>{mainName}</span>
        {typesJoined && <span> ({typesJoined})</span>}
      </div>
      {altNamesJoined && (
        <div className={styles.altNamesSection}>
          also known as: {altNamesJoined}
        </div>
      )}
    </li>
  );
};

export default ArtistEntriesListItem;
