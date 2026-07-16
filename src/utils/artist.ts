import { ArtistType } from "@/types/db/database";

export const formatArtistTypeLabel = (type: ArtistType): string =>
  type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
