import { type FC } from "react";

import styles from "./ArtistEntriesListItem.module.css";

import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesListItemProps = {
  entry: EntrySearchResult;
};

const ArtistEntriesListItem: FC<ArtistEntriesListItemProps> = ({ entry }) => {
  const { mainName, types } = entry;
  const hasTypes = types.length > 0;
  const typesJoined = hasTypes ? types.join(", ") : null;

  return (
    <li className={styles.item}>
      <span className={styles.mainName}>{mainName}</span>
      {typesJoined && <span> ({typesJoined})</span>}
    </li>
  );
};

export default ArtistEntriesListItem;
