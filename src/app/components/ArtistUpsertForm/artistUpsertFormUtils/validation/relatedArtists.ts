import { validate as isValidUuid } from "uuid";

import type {
  ArtistUpsertRelatedArtistRow,
  ValidArtistUpsertRelatedParentRow,
} from "../formValues";

import type { FormFieldError, FormFieldValidationResult } from "@/types/form";

export const validateRelatedArtists = (
  rows: ArtistUpsertRelatedArtistRow[],
): FormFieldValidationResult<
  ValidArtistUpsertRelatedParentRow[],
  Record<string, FormFieldError[]>,
  ArtistUpsertRelatedArtistRow[]
> => {
  const errors: Record<string, FormFieldError[]> = {};
  const validatedRows: ArtistUpsertRelatedArtistRow[] = [];
  const notifications = [];
  const seenArtistIds = new Map<string, string>();
  let valid = true;

  for (const row of rows) {
    const rowErrors = [];
    const trimmedArtistId = row.artistId.trim();

    if (row.relation === "") {
      rowErrors.push({
        message: "Choose whether this artist is a parent or a child.",
      });
    }

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
      rowErrors.push({ message: "Artist ID must be a valid UUID." });
    }

    if (rowErrors.length > 0) {
      valid = false;
      errors[row.id] = rowErrors;
    }

    validatedRows.push({ ...row, artistId: trimmedArtistId });

    if (trimmedArtistId !== row.artistId) {
      notifications.push({
        notification: `Note: artist ID "${trimmedArtistId}" has been trimmed`,
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

    // Relation is verified above for every row when valid is true.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    value: validatedRows as ValidArtistUpsertRelatedParentRow[],
    notifications: notifications.length > 0 ? notifications : undefined,
  };
};
