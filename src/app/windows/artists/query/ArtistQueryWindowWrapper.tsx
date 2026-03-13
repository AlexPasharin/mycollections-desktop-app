import type { FC } from "react";

import ArtistQuery from "./components/ArtistQuery";

const ArtistQueryWindowWrapper: FC = () => (
  <>
    <h1>My Collections</h1>
    <ArtistQuery />
  </>
);

export default ArtistQueryWindowWrapper;
