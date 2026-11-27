import { type FC } from "react";

import api from "../../api";

import type { DbSource } from "@/db/db-source";
import type { EntryArtistInfo } from "@/types/entries";

type EntryArtistsProps = {
  artists: EntryArtistInfo[];
  primaryDbSource: DbSource;
};

const EntryArtists: FC<EntryArtistsProps> = ({ artists, primaryDbSource }) => {
  const mainArtist = artists.find((a) => a.isEntriesMainArtist === true);
  const otherArtists = artists.filter(
    (a) => a.artistId !== mainArtist?.artistId,
  );

  const openArtistWindow = (artistId: string) => {
    api.openNewArtistWindow({
      artistId,
      source: primaryDbSource,
    });
  };

  return (
    <div className="mb-2 text-[0.95em]">
      {artists.length === 0 ? (
        <p className="m-0 italic">
          (Entry has no artists, please update database)
        </p>
      ) : (
        <>
          <span className="mb-1 inline-block font-semibold">By</span>{" "}
          {mainArtist && (
            <button
              type="button"
              className="m-0 cursor-pointer border-none bg-transparent p-0 text-[1.12em] leading-[1.25] font-bold tracking-[0.01em] hover:underline"
              onClick={() => openArtistWindow(mainArtist.artistId)}
            >
              {mainArtist.artistName}
            </button>
          )}
          {otherArtists.length > 0 && (
            <ul
              className={`list-none pl-0 ${mainArtist ? "mt-[0.45rem]" : "mt-0"}`}
            >
              {otherArtists.map((a) => (
                <li key={`${a.artistId}-${a.artistName}`}>
                  {!!mainArtist && `also featuring: `}
                  <button
                    type="button"
                    className="m-0 cursor-pointer border-none bg-transparent p-0 text-[length:inherit] hover:underline"
                    onClick={() => openArtistWindow(a.artistId)}
                  >
                    {a.artistName}
                  </button>
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
