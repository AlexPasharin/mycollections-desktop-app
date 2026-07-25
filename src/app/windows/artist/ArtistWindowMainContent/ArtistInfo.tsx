import { type FC } from "react";

import CopyTextCta from "@/app/components/CopyTextCta";
import type { ArtistByIdResult } from "@/types/artists";
import { formatArtistTypeLabel } from "@/utils/artist";

type ArtistInfoProps = {
  artist: ArtistByIdResult;
};

const ArtistInfo: FC<ArtistInfoProps> = ({ artist }) => {
  const { artistId, name, type, partOfQueenFamily, altNames } = artist;

  return (
    <div className="mb-4 rounded-md border border-black px-4 py-3">
      <div className="mb-2">
        <p className="m-0 mb-[0.35rem] text-[1.15em] font-bold">{name}</p>
        <CopyTextCta
          text={artistId}
          label="copy artist's id"
          successMessage="Artist id copied to clipboard"
          errorMessage="Could not copy artist id to clipboard"
        />
      </div>
      {altNames.length > 0 && (
        <div className="mt-2 mb-[0.35rem]">
          <p className="m-0 mb-[0.35rem] text-[0.95em] italic">
            Also known as:
          </p>
          <ul className="m-0 flex list-none flex-col gap-[0.65rem] p-0">
            {altNames.map((altName) => (
              <li key={altName.nameId} className="flex flex-wrap gap-2">
                <p className="mt-3 text-[0.95em] italic">{altName.name}</p>
                <CopyTextCta
                  text={altName.nameId}
                  label="copy alt name's id"
                  successMessage="Alt name id copied to clipboard"
                  errorMessage="Could not copy alt name id to clipboard"
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="m-0 text-[0.95em]">
        {formatArtistTypeLabel(type)}
        {partOfQueenFamily && " · Part of Queen family"}
      </p>
    </div>
  );
};

export default ArtistInfo;
