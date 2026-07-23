import { type FC } from "react";

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
  <ul className="mt-3 list-none pl-0">
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
