import type { FC } from "react";

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
        <li key={id}>{name}</li>
      ))}
    </ol>
  );
};

export default ArtistsList;
