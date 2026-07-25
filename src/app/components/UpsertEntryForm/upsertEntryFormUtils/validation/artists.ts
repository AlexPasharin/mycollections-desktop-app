import { validate as isValidUuid } from "uuid";

import type { UpsertEntryArtistsErrors } from "../errorMessages";
import type { UpsertEntryArtistRow } from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";

export const validateArtists = (
  rows: UpsertEntryArtistRow[],
): FormFieldValidationResult<
  UpsertEntryArtistRow[],
  UpsertEntryArtistsErrors,
  UpsertEntryArtistRow[]
> => {
  const errors: UpsertEntryArtistsErrors = {};
  const validatedRows: UpsertEntryArtistRow[] = [];
  const notifications = [];
  const seenArtistIds = new Map<string, string>();
  let valid = true;

  for (const row of rows) {
    const rowErrors = [];
    const trimmedArtistId = row.artistId.trim();
    const trimmedAltNameId = row.entryArtistAltNameId.trim();

    if (isValidUuid(trimmedArtistId)) {
      const firstRowId = seenArtistIds.get(trimmedArtistId);

      if (firstRowId === undefined) {
        seenArtistIds.set(trimmedArtistId, row.id);
      } else {
        rowErrors.push({
          message: `Duplicate artist id ${trimmedArtistId}.`,
          sources: ["artistId"],
        });
      }
    } else {
      rowErrors.push({
        message: "Artist ID must be a valid UUID.",
        sources: ["artistId"],
      });
    }

    if (trimmedAltNameId !== "" && !isValidUuid(trimmedAltNameId)) {
      rowErrors.push({
        message: "Alternative artist name ID must be a valid UUID.",
        sources: ["entryArtistAltNameId"],
      });
    }

    if (rowErrors.length > 0) {
      valid = false;
      errors[row.id] = rowErrors;
    }

    validatedRows.push({
      ...row,
      artistId: trimmedArtistId,
      entryArtistAltNameId: trimmedAltNameId,
    });

    if (trimmedArtistId !== row.artistId) {
      notifications.push({
        notification: `Note: artist ID "${trimmedArtistId}" has been trimmed`,
        sources: ["artistId"],
      });
    }

    if (trimmedAltNameId !== row.entryArtistAltNameId) {
      notifications.push({
        notification: `Note: alternative artist name ID "${trimmedAltNameId}" has been trimmed`,
        sources: ["entryArtistAltNameId"],
      });
    }
  }

  if (!valid) {
    return {
      valid: false,
      value: validatedRows,
      errorMessages: errors,
      notifications: notifications.length > 0 ? notifications : undefined,
    };
  }

  return {
    valid: true,
    value: validatedRows,
    notifications: notifications.length > 0 ? notifications : undefined,
  };
};
