import type { FC } from "react";

import api from "../../api";

import ArtistListElement from "@/app/components/Artist";
import type { QueriedArtist } from "@/types/artists";

type ArtistQueryListProps = {
  artists: QueriedArtist[];
};

const ArtistQueryList: FC<ArtistQueryListProps> = ({ artists }) => {
  if (!artists.length) {
    return <div>No artists found</div>;
  }

  return (
    <ul>
      {artists.map(({ artistId, name, altNameId }) => (
        <ArtistListElement
          key={altNameId ? `${artistId}-${altNameId}` : artistId}
          artist={{ name }}
          onArtistSelect={() => api.openNewArtistWindow({ artistId })}
        />
      ))}
    </ul>
  );
};

export default ArtistQueryList;
