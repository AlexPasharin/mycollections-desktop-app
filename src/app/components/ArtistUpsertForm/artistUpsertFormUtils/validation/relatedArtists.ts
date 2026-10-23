import { validate as isValidUuid } from "uuid";

import type {
  ArtistUpsertRelatedArtistRow,
  ValidArtistUpsertRelatedParentRow,
} from "../formValues";

import type {
  FormFeedbackMessages,
  FormValidationFnResult,
} from "@/hooks/useFormState";

export const validateRelatedArtists = (
  rows: ArtistUpsertRelatedArtistRow[],
): FormValidationFnResult<
  ArtistUpsertRelatedArtistRow[],
  ValidArtistUpsertRelatedParentRow[]
> => {
  const errors: FormFeedbackMessages = [];
  const processedRows: ArtistUpsertRelatedArtistRow[] = [];
  const validatedRows: ValidArtistUpsertRelatedParentRow[] = [];
  const notifications = [];
  const seenArtistIds = new Map<string, string>();

  for (const row of rows) {
    const { relation, id, artistId } = row;
    const trimmedArtistId = artistId.trim();

    const rowErrors = [];

    if (relation === "") {
      errors.push({
        message: "Choose whether this artist is a parent or a child.",
        sources: [id, "relation"],
      });
    }

    if (isValidUuid(trimmedArtistId)) {
      const firstRowId = seenArtistIds.get(trimmedArtistId);

      if (firstRowId === undefined) {
        seenArtistIds.set(trimmedArtistId, id);
      } else {
        rowErrors.push({
          message: `Duplicate artist id ${trimmedArtistId}.`,
          sources: [id, "artistId"],
        });
      }
    } else {
      errors.push({
        message: "Artist ID must be a valid UUID.",
        sources: [id, "artistId"],
      });
    }

    const newRow = {
      id,
      artistId: trimmedArtistId,
    };

    if (relation !== "") {
      validatedRows.push({
        ...newRow,
        relation,
      });
    }

    processedRows.push({
      ...newRow,
      relation,
    });

    if (trimmedArtistId !== row.artistId) {
      notifications.push({
        message: `Note: artist ID "${trimmedArtistId}" has been trimmed`,
        sources: [id, "artistId"],
      });
    }
  }

  if (errors.length > 0) {
    return {
      value: processedRows,
      errors,
      notifications,
    };
  }

  return {
    validatedValue: validatedRows,
    notifications,
  };
};
