import { validate as isValidUuid } from "uuid";

import type {
  UpsertEntryArtistRow,
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
} from "../formValues";

import type {
  FormFeedbackMessages,
  FormValidationFn,
} from "@/hooks/useFormState";

export const validateArtists: FormValidationFn<
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
  "artists"
> = (state) => {
  const errors: FormFeedbackMessages = [];
  const notifications: FormFeedbackMessages = [];
  const validatedRows: UpsertEntryArtistRow[] = [];
  const seenArtistIds = new Map<string, string>();

  for (const row of state.artists.value) {
    const trimmedArtistId = row.artistId.trim();
    const trimmedAltNameId = row.entryArtistAltNameId.trim();

    if (isValidUuid(trimmedArtistId)) {
      const firstRowId = seenArtistIds.get(trimmedArtistId);

      if (firstRowId === undefined) {
        seenArtistIds.set(trimmedArtistId, row.id);
      } else {
        errors.push({
          message: `Duplicate artist id ${trimmedArtistId}.`,
          sources: [row.id, "artistId"],
        });
      }
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

  if (errors.length > 0) {
    return {
      value: validatedRows,
      errors,
      notifications,
    };
  }

  return {
    validatedValue: validatedRows,
    notifications,
  };
};
