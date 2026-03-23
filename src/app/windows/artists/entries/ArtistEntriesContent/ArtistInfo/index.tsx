import { type FC } from "react";

import styles from "./ArtistInfo.module.css";

import type { ArtistByIdResult } from "@/types/artists";

type ArtistInfoProps = {
  artist: ArtistByIdResult;
};

const ArtistInfo: FC<ArtistInfoProps> = ({ artist }) => {
  const { name, type, partOfQueenFamily } = artist;

  return (
    <div className={styles.artistInfoBox}>
      <p className={styles.artistName}>{name}</p>
      <p className={styles.artistDetails}>
        {type}
        {partOfQueenFamily && " · Part of Queen family"}
      </p>
    </div>
  );
};

export default ArtistInfo;
