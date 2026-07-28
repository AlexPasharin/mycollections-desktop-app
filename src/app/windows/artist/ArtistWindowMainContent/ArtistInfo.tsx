import { type FC } from "react";

import api from "../api";

import CopyTextCta from "@/app/components/CopyTextCta";
import type { DbSource } from "@/db/db-source";
import type { ArtistByIdResult, RelatedArtistItem } from "@/types/artists";
import { formatArtistTypeLabel } from "@/utils/artist";

type ArtistInfoProps = {
  artist: ArtistByIdResult;
  primaryDbSource: DbSource;
};

const ArtistInfo: FC<ArtistInfoProps> = ({ artist, primaryDbSource }) => {
  const {
    artistId,
    name,
    type,
    partOfQueenFamily,
    altNames,
    parentArtists,
    childArtists,
  } = artist;

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

      <RelatedArtists
        parentArtists={parentArtists}
        childArtists={childArtists}
        primaryDbSource={primaryDbSource}
      />
    </div>
  );
};

export default ArtistInfo;

type RelatedArtistsProps = {
  parentArtists: RelatedArtistItem[];
  childArtists: RelatedArtistItem[];
  primaryDbSource: DbSource;
};

const RelatedArtists: FC<RelatedArtistsProps> = ({
  parentArtists,
  childArtists,
  primaryDbSource,
}) => {
  if (parentArtists.length === 0 && childArtists.length === 0) {
    return null;
  }

  const openRelatedArtistWindow = (relatedArtist: RelatedArtistItem) => {
    api.openNewArtistWindow({
      artistId: relatedArtist.artistId,
      source: primaryDbSource,
    });
  };

  return (
    <div className="mt-[0.85rem] flex flex-col gap-[0.65rem] border-t border-[#e0dcf5] pt-[0.85rem] text-[0.92em]">
      {parentArtists.length > 0 && (
        <RelatedArtistsSection
          label="Parent artists:"
          artists={parentArtists}
          onArtistSelect={openRelatedArtistWindow}
        />
      )}
      {childArtists.length > 0 && (
        <RelatedArtistsSection
          label="Child artists:"
          artists={childArtists}
          onArtistSelect={openRelatedArtistWindow}
        />
      )}
    </div>
  );
};

type RelatedArtistsSectionProps = {
  label: string;
  artists: RelatedArtistItem[];
  onArtistSelect: (artist: RelatedArtistItem) => void;
};

const RelatedArtistsSection: FC<RelatedArtistsSectionProps> = ({
  label,
  artists,
  onArtistSelect,
}) => (
  <div>
    <span className="mb-1 block font-semibold">{label}</span>
    <ul className="m-0 list-none p-0 [&>li+li]:mt-[0.2rem]">
      {artists.map((relatedArtist) => (
        <li key={relatedArtist.artistId}>
          <button
            type="button"
            className="m-0 cursor-pointer border-none bg-transparent p-0 text-left font-[inherit] text-[#1a5fb4] text-[inherit] underline hover:text-[#0d3d82] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a5fb4]"
            onClick={() => onArtistSelect(relatedArtist)}
          >
            {relatedArtist.name}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
