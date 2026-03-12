import type { FC } from "react";

import styles from "./styles.module.css";

import api from "@/app/artists/list/api";
import type { DBArtist } from "@/types/artists";

interface ArtistProps {
  artist: DBArtist;
}

const openArtistEntriesWindow = (): void => {
  api.openNewArtistEntriesListWindow();
};

const ArtistListElement: FC<ArtistProps> = ({ artist }) => {
  const { name } = artist;

  return (
    <li
      className={styles.artist}
      onClick={openArtistEntriesWindow}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openArtistEntriesWindow();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {name}
    </li>
  );
};

export default ArtistListElement;
