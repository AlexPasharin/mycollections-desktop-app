import { type FC } from "react";

import styles from "./EntryArtists.module.css";

import entryStyles from "../Entry.module.css";

import type { EntryArtistInfo } from "@/types/entries";

type EntryArtistsProps = {
  artists: EntryArtistInfo[];
};

const EntryArtists: FC<EntryArtistsProps> = ({ artists }) => {
  const mainArtistIndex = artists.findIndex(
    (a) => a.isEntriesMainArtist === true,
  );
  const hasMainArtist = mainArtistIndex >= 0;
  const mainArtist = hasMainArtist ? artists[mainArtistIndex] : undefined;
  const otherArtists = hasMainArtist
    ? artists.filter((_, i) => i !== mainArtistIndex)
    : artists;

  return (
    <div className={entryStyles.field}>
      <span className={entryStyles.fieldLabel}>By</span>
      {artists.length > 0 ? (
        <ul className={styles.artistsList}>
          {hasMainArtist && mainArtist ? (
            <>
              <li
                key={`main-${mainArtist.artistId}-${mainArtist.artistName ?? ""}`}
              >
                {mainArtist.artistName ?? "(unnamed)"}
              </li>
              {otherArtists.map((a) => (
                <li key={`${a.artistId}-${a.artistName ?? ""}`}>
                  also featuring: {a.artistName ?? "(unnamed)"}
                </li>
              ))}
            </>
          ) : (
            artists.map((a) => (
              <li key={`${a.artistId}-${a.artistName ?? ""}`}>
                {a.artistName ?? "(unnamed)"}
              </li>
            ))
          )}
        </ul>
      ) : (
        " —"
      )}
    </div>
  );
};

export default EntryArtists;
