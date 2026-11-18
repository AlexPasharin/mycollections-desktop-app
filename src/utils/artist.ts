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
  let mainArtists = artists.filter((artist) => artist.isEntriesMainArtist);

  if (!mainArtists.length) {
    mainArtists = artists;
  }

  if (mainArtists.length > 0) {
    return mainArtists.map((artist) => artist.artistName).join(", ");
  }

  return "(Unknown artist)";
};
