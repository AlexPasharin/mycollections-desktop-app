import type { FC } from "react";

import type { Artist } from "@/prisma/generated";

type ArtistsByQueryListProps = {
  artists: Artist[];
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
