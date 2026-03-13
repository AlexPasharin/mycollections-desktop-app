import type { FC } from "react";

import api from "./api";

const MainWindowWrapper: FC = () => (
  <>
    <h1>My Collections</h1>
    <button onClick={api.openNewArtistQueryWindow}>Find artist</button>
    <button onClick={api.openNewArtistsListWindow}>Open Artists Window</button>
  </>
);

export default MainWindowWrapper;
