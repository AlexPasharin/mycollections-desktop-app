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
  const seenArtistIds = new Map<string, string[]>();

  for (const row of rows) {
    const { relation, id, artistId } = row;
    const trimmedArtistId = artistId.trim();

    const newRow = {
      id,
      artistId: trimmedArtistId,
    };

    if (relation === "") {
      errors.push({
        message: "Choose whether this artist is a parent or a child.",
        sources: [id, "relation"],
      });
    } else {
      validatedRows.push({
        ...newRow,
        relation,
      });
    }

    if (isValidUuid(trimmedArtistId)) {
      seenArtistIds.set(trimmedArtistId, [
        ...(seenArtistIds.get(trimmedArtistId) ?? []),
        id,
      ]);
    } else {
      errors.push({
        message: "Artist ID must be a valid UUID.",
        sources: [id, "artistId"],
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

  for (const [artistId, ids] of seenArtistIds.entries()) {
    if (ids.length > 1) {
      errors.push({
        message: `Duplicate artist ID "${artistId}".`,
        sources: [...ids, "artistId"],
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
