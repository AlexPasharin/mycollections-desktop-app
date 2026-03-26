import type { FC } from "react";

import ArtistList from "@/app/windows/artists/list/components/ArtistsList";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ArtistsWindowWrapper: FC = () => {
  useDocumentTitle("Artists");

  return (
    <>
      <h1>All artists view</h1>
      <ArtistList />
    </>
  );
};

export default ArtistsWindowWrapper;
