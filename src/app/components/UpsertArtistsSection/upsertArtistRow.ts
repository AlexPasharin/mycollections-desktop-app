import { withNewId } from "@/utils/id";

export type UpsertArtistRow = {
  id: string;
  artistId: string;
  entryArtistAltNameId: string;
  isMainArtist: boolean;
};

export const defaultArtistRow = (): UpsertArtistRow =>
  withNewId({
    artistId: "",
    entryArtistAltNameId: "",
    isMainArtist: false,
  });
