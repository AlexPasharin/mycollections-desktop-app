import type { FC } from "react";

import styles from "./styles.module.css";

import api from "@/app/windows/artists/list/api";
import type { DBArtist } from "@/types/artists";

interface ArtistProps {
  artist: DBArtist;
}

const ArtistListElement: FC<ArtistProps> = ({ artist }) => {
  const { name, artistId } = artist;

  const openArtistEntriesWindow = (): void => {
    api.openNewArtistEntriesListWindow({ artistId });
  };

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
