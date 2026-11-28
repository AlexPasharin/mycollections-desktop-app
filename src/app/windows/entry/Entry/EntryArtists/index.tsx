import { type FC } from "react";

import api from "../../api";

import ArtistsAttribution from "@/app/components/ArtistsAttribution";
import type { DbSource } from "@/db/db-source";
import type { EntryArtistInfo } from "@/types/entries";

type EntryArtistsProps = {
  artists: EntryArtistInfo[];
  primaryDbSource: DbSource;
};

const EntryArtists: FC<EntryArtistsProps> = ({ artists, primaryDbSource }) => (
  <ArtistsAttribution
    artists={artists.map(({ artistId, artistName, isEntriesMainArtist }) => ({
      artistId,
      artistName,
      isMainArtist: isEntriesMainArtist,
    }))}
    onOpenArtist={(artistId) => {
      api.openNewArtistWindow({
        artistId,
        source: primaryDbSource,
      });
    }}
    emptyMessage="(Entry has no artists, please update database)"
  />
);

export default EntryArtists;
