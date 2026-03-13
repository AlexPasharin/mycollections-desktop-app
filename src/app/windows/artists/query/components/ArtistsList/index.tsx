import type { FC } from "react";

import api from "../../api";

import ArtistListElement from "@/app/components/Artist";
import type { QueriedArtist } from "@/types/artists";

type ArtistsByQueryListProps = {
  artists: QueriedArtist[];
};

const ArtistsList: FC<ArtistsByQueryListProps> = ({ artists }) => {
  if (!artists.length) {
    return <div>No artists found</div>;
  }

  return (
    <ol>
      {artists.map(({ id, name }) => (
        <ArtistListElement
          key={id}
          artist={{ name }}
          onArtistSelect={() =>
            api.openNewArtistEntriesListWindow({ artistId: id })
          }
        />
      ))}
    </ol>
  );
};

export default ArtistsList;
