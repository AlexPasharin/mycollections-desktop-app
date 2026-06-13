import type { FC } from "react";

type Artist = { name: string };

type ArtistProps = {
  artist: Artist;
  onArtistSelect: () => void;
};

const ArtistListElement: FC<ArtistProps> = ({ artist, onArtistSelect }) => {
  const { name } = artist;

  return (
    <li
      className="cursor-pointer font-semibold"
      onClick={onArtistSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onArtistSelect();
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
