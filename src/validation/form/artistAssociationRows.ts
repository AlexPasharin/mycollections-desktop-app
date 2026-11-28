import { validate as isValidUuid } from "uuid";

import type { UpsertArtistRow } from "@/app/components/UpsertArtistsSection/upsertArtistRow";
import type { FormFeedbackMessages } from "@/types/form";

export type ValidateArtistAssociationRowsResult = {
  validatedRows: UpsertArtistRow[];
  errors: FormFeedbackMessages;
  notifications: FormFeedbackMessages;
};

export const validateArtistAssociationRows = (
  rows: UpsertArtistRow[],
): ValidateArtistAssociationRowsResult => {
  const errors: FormFeedbackMessages = [];
  const notifications: FormFeedbackMessages = [];
  const validatedRows: UpsertArtistRow[] = [];
  const seenArtistIds = new Map<string, string[]>();

  for (const row of rows) {
    const trimmedArtistId = row.artistId.trim();
    const trimmedAltNameId = row.entryArtistAltNameId.trim();

    if (isValidUuid(trimmedArtistId)) {
      seenArtistIds.set(trimmedArtistId, [
        ...(seenArtistIds.get(trimmedArtistId) ?? []),
        row.id,
      ]);
    } else {
      errors.push({
        message: "Artist ID must be a valid UUID.",
        sources: [row.id, "artistId"],
      });
    }

    if (trimmedAltNameId !== "" && !isValidUuid(trimmedAltNameId)) {
      errors.push({
        message: "Alternative artist name ID must be a valid UUID.",
        sources: [row.id, "entryArtistAltNameId"],
      });
    }

    validatedRows.push({
      ...row,
      artistId: trimmedArtistId,
      entryArtistAltNameId: trimmedAltNameId,
    });

    if (trimmedArtistId !== row.artistId) {
      notifications.push({
        message: `Note: artist ID "${trimmedArtistId}" has been trimmed`,
        sources: [row.id, "artistId"],
      });
    }

    if (trimmedAltNameId !== row.entryArtistAltNameId) {
      notifications.push({
        message: `Note: alternative artist name ID "${trimmedAltNameId}" has been trimmed`,
        sources: [row.id, "entryArtistAltNameId"],
      });
    }
  }

  for (const [artistId, ids] of seenArtistIds.entries()) {
    if (ids.length > 1) {
      errors.push({
        message: `Duplicate artist ID "${artistId}".`,
        sources: [...ids, "artistId"],
      });
    }
  }

  return { validatedRows, errors, notifications };
};
