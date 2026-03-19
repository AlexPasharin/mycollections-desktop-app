import { type FC } from "react";

import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesListProps = {
  entries: EntrySearchResult[];
};

const ArtistEntriesList: FC<ArtistEntriesListProps> = ({ entries }) => (
  <ul>
    {entries.map((entry) => (
      <li key={entry.entryId}>{entry.mainName}</li>
    ))}
  </ul>
);

export default ArtistEntriesList;
