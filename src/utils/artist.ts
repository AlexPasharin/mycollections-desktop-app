import { ArtistType } from "@/types/db/database";

export const formatArtistTypeLabel = (type: ArtistType): string =>
  type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

export const formatEntryArtistsLabel = (
  artists: {
    isEntriesMainArtist: boolean | null;
    artistName: string;
  }[],
): string => {
  const mainArtist = artists.find(
    (artist) => artist.isEntriesMainArtist === true,
  );

  if (mainArtist) {
    return mainArtist.artistName;
  }

  if (artists.length > 0) {
    return artists.map((artist) => artist.artistName).join(", ");
  }

  return "(Unknown artist)";
};
