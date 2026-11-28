import { type FC } from "react";

import ArtistEntriesGroup from "./ArtistEntriesGroup";

import type { DbSource } from "@/db/db-source";
import useFetch from "@/hooks/useFetch";
import type {
  FetchArtistEntriesGroupedByType,
  FetchArtistEntriesOfType,
  OpenEntryWindow,
} from "@/types/entries";

type ArtistEntriesProps = {
  artistId: string;
  dbSource: DbSource;

  /** Both fetchers must be referentially stable. */
  onFetchGroups: FetchArtistEntriesGroupedByType;
  onFetchGroupEntries: FetchArtistEntriesOfType;

  onOpenEntry: OpenEntryWindow;
};

const ArtistEntries: FC<ArtistEntriesProps> = ({
  artistId,
  dbSource,
  onFetchGroups,
  onFetchGroupEntries,
  onOpenEntry,
}) => {
  const {
    data: groups,
    error,
    isLoading,
  } = useFetch(onFetchGroups, [artistId, dbSource], {
    errorMessage: "Failed to fetch entry groups",
  });

  if (isLoading) {
    return <p>Loading…</p>;
  }

  if (error !== null) {
    return <p>Failed to load entries.</p>;
  }

  if (!groups?.length) {
    return <p>This artist has no entries yet.</p>;
  }

  return (
    <div className="mt-3">
      {groups.map((group) => (
        <ArtistEntriesGroup
          key={`${dbSource}:${artistId}:${group.typeId ?? "no-type"}`}
          artistId={artistId}
          dbSource={dbSource}
          group={group}
          onFetchGroupEntries={onFetchGroupEntries}
          onOpenEntry={({ entryId, viaSpecialArtistOnly }) => {
            onOpenEntry({
              entryId,
              source: dbSource,
              ...(viaSpecialArtistOnly && { specialArtist: artistId }),
            });
          }}
        />
      ))}
    </div>
  );
};

export default ArtistEntries;
