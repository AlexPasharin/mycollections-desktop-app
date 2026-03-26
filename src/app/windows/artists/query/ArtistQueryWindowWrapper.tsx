import type { FC } from "react";

import ArtistQuery from "./components/ArtistQuery";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ArtistQueryWindowWrapper: FC = () => {
  useDocumentTitle("Artist Query Window");

  return <ArtistQuery />;
};

export default ArtistQueryWindowWrapper;
