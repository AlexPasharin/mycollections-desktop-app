import type { FC } from "react";

import ArtistList from "@/app/artists/list/components/ArtistsList";

const ArtistsWindowWrapper: FC = () => (
  <>
    <h1>My Collections</h1>
    <ArtistList />
  </>
);

export default ArtistsWindowWrapper;
