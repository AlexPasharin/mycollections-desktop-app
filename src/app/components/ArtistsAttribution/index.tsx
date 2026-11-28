import { type FC } from "react";

export type ArtistsAttributionItem = {
  artistId: string;
  artistName: string;
  isMainArtist: boolean | null;
};

type ArtistsAttributionProps = {
  artists: ArtistsAttributionItem[];
  onOpenArtist: (artistId: string) => void;
  emptyMessage?: string;
};

const ArtistsAttribution: FC<ArtistsAttributionProps> = ({
  artists,
  onOpenArtist,
  emptyMessage,
}) => {
  if (artists.length === 0) {
    if (emptyMessage === undefined) {
      return null;
    }

    return (
      <div className="mb-2 text-[0.95em]">
        <p className="m-0 italic">{emptyMessage}</p>
      </div>
    );
  }

  const mainArtist = artists.find((artist) => artist.isMainArtist === true);
  const otherArtists = artists.filter(
    (artist) => artist.artistId !== mainArtist?.artistId,
  );

  return (
    <div className="mb-2 text-[0.95em]">
      <span className="mb-1 inline-block font-semibold">By</span>{" "}
      {mainArtist && (
        <button
          type="button"
          className="m-0 cursor-pointer border-none bg-transparent p-0 text-[1.12em] leading-[1.25] font-bold tracking-[0.01em] hover:underline"
          onClick={() => onOpenArtist(mainArtist.artistId)}
        >
          {mainArtist.artistName}
        </button>
      )}
      {otherArtists.length > 0 && (
        <ul
          className={`list-none pl-0 ${mainArtist ? "mt-[0.45rem]" : "mt-0"}`}
        >
          {otherArtists.map((artist) => (
            <li key={`${artist.artistId}-${artist.artistName}`}>
              {mainArtist !== undefined && `also featuring: `}
              <button
                type="button"
                className="m-0 cursor-pointer border-none bg-transparent p-0 text-[length:inherit] hover:underline"
                onClick={() => onOpenArtist(artist.artistId)}
              >
                {artist.artistName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArtistsAttribution;
