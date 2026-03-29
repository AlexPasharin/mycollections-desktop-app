import { type FC } from "react";

import styles from "./EntryArtists.module.css";

import type { EntryArtistInfo } from "@/types/entries";

type EntryArtistsProps = {
  artists: EntryArtistInfo[];
};

const EntryArtists: FC<EntryArtistsProps> = ({ artists }) => {
  const mainArtist = artists.find((a) => a.isEntriesMainArtist === true);
  const otherArtists = mainArtist
    ? artists.filter((a) => a.artistId !== mainArtist.artistId)
    : artists;

  return (
    <div className={styles.field}>
      {artists.length === 0 ? (
        <p className={styles.emptyNote}>
          (Entry has no artists, please update database)
        </p>
      ) : (
        <>
          <span className={styles.fieldLabel}>By</span>
          {mainArtist && (
            <p className={styles.mainArtist}>{mainArtist.artistName}</p>
          )}
          {otherArtists.length > 0 && (
            <ul className={styles.artistsList}>
              {otherArtists.map((a) => (
                <li key={`${a.artistId}-${a.artistName}`}>
                  {!!mainArtist && `also featuring: `}
                  {a.artistName}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default EntryArtists;
