import type { UpsertArtistRow } from "@/app/components/UpsertArtistsSection/upsertArtistRow";
import type { ReleaseByIdResult } from "@/types/releases";
import { withNewId } from "@/utils/id";

export const specialArtistsToFormValue = (
  specialArtists: ReleaseByIdResult["specialArtists"] | undefined,
): UpsertArtistRow[] =>
  (specialArtists ?? []).map(
    ({ artistId, entryArtistAltNameId, isReleasesMainArtist }) =>
      withNewId({
        artistId,
        entryArtistAltNameId: entryArtistAltNameId ?? "",
        isMainArtist: isReleasesMainArtist ?? false,
      }),
  );
