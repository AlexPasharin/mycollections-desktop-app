import { type FC } from "react";

import ArtistInfo from "./ArtistInfo";

import ArtistEntriesSearch from "../ArtistEntriesSearch";

import type { ArtistByIdResult } from "@/types/artists";

type ArtistEntriesContentProps = {
  artist: ArtistByIdResult;
};

const ArtistEntriesContent: FC<ArtistEntriesContentProps> = ({ artist }) => (
  <div>
    <ArtistInfo artist={artist} />
    <ArtistEntriesSearch artistId={artist.artistId} />
  </div>
);

export default ArtistEntriesContent;
