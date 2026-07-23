import { type FC } from "react";

import type { ArtistByIdResult } from "@/types/artists";
import { formatArtistTypeLabel } from "@/utils/artist";

type ArtistInfoProps = {
  artist: ArtistByIdResult;
};

const ArtistInfo: FC<ArtistInfoProps> = ({ artist }) => {
  const { name, type, partOfQueenFamily, altNames } = artist;
  const altNamesJoined = altNames.map((altName) => altName.name).join(", ");

  return (
    <div className="mb-4 rounded-md border border-black px-4 py-3">
      <p className="m-0 mb-[0.35rem] text-[1.15em] font-bold">{name}</p>
      {altNamesJoined && (
        <p className="m-0 mb-[0.35rem] text-[0.95em] italic">
          Also known as: {altNamesJoined}
        </p>
      )}
      <p className="m-0 text-[0.95em]">
        {formatArtistTypeLabel(type)}
        {partOfQueenFamily && " · Part of Queen family"}
      </p>
    </div>
  );
};

export default ArtistInfo;
