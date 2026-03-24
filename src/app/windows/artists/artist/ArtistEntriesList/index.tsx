import { type FC } from "react";

import styles from "./ArtistEntriesList.module.css";

import ArtistEntriesListItem from "../ArtistEntriesListItem";

import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesListProps = {
  entries: EntrySearchResult[];
};

const ArtistEntriesList: FC<ArtistEntriesListProps> = ({ entries }) => (
  <ul className={styles.list}>
    {entries.map((entry) => (
      <ArtistEntriesListItem key={entry.entryId} entry={entry} />
    ))}
  </ul>
);

export default ArtistEntriesList;
