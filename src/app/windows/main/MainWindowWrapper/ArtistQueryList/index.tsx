import type { FC } from "react";

import api from "../../api";

import ArtistListElement from "@/app/components/Artist";
import type { DbSource } from "@/db/db-source";
import type { QueriedArtist } from "@/types/artists";

type ArtistQueryListProps = {
  artists: QueriedArtist[];
  dbSource: DbSource;
};

const ArtistQueryList: FC<ArtistQueryListProps> = ({ artists, dbSource }) => {
  if (!artists.length) {
    return <div>No artists found</div>;
  }

  return (
    <ul>
      {artists.map(({ artistId, name, altNameId }) => (
        <ArtistListElement
          key={altNameId ? `${artistId}-${altNameId}` : artistId}
          artist={{ name }}
          onArtistSelect={() =>
            api.openNewArtistWindow({ artistId, source: dbSource })
          }
        />
      ))}
    </ul>
  );
};

export default ArtistQueryList;
