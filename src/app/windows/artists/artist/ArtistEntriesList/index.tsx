import { type FC } from "react";

import styles from "./ArtistEntriesList.module.css";

import ArtistEntriesListItem from "../ArtistEntriesListItem";

import type { DbSource } from "@/db/db-source";
import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesListProps = {
  entries: EntrySearchResult[];
  dbSource: DbSource;
};

const ArtistEntriesList: FC<ArtistEntriesListProps> = ({
  entries,
  dbSource,
}) => (
  <ul className={styles.list}>
    {entries.map((entry) => (
      <ArtistEntriesListItem
        key={entry.entryId}
        entry={entry}
        dbSource={dbSource}
      />
    ))}
  </ul>
);

export default ArtistEntriesList;
