import { type FC } from "react";

import type { EntryArtistInfo } from "@/types/entries";

type EntryArtistsProps = {
  artists: EntryArtistInfo[];
};

const EntryArtists: FC<EntryArtistsProps> = ({ artists }) => {
  const mainArtist = artists.find((a) => a.isEntriesMainArtist === true);
  const otherArtists = artists.filter(
    (a) => a.artistId !== mainArtist?.artistId,
  );

  return (
    <div className="mb-2 text-[0.95em]">
      {artists.length === 0 ? (
        <p className="m-0 italic">
          (Entry has no artists, please update database)
        </p>
      ) : (
        <>
          <span className="mb-1 inline-block font-semibold">By</span>
          {mainArtist && (
            <p className="m-0 p-0 text-[1.12em] leading-[1.25] font-bold tracking-[0.01em]">
              {mainArtist.artistName}
            </p>
          )}
          {otherArtists.length > 0 && (
            <ul
              className={`list-none pl-0 ${mainArtist ? "mt-[0.45rem]" : "mt-0"}`}
            >
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
