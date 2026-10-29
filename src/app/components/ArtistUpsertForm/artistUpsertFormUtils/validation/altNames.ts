import type {
  ArtistUpsertAltNameRow,
  ArtistUpsertFormDraft,
  ValidatedArtistUpsertFormDraft,
} from "../formValues";

import type {
  FormFeedbackMessages,
  FormValidationFn,
} from "@/hooks/useFormState";

export const validateArtistAltNames: FormValidationFn<
  ArtistUpsertFormDraft,
  ValidatedArtistUpsertFormDraft,
  "altNames"
> = (state) => {
  const mainName = state.name.value.trim();
  const seenNames = new Map<string, string[]>();
  const errors: FormFeedbackMessages = [];

  const normalizedRows: ArtistUpsertAltNameRow[] = [];
  const notifications = [];

  for (const row of state.altNames.value) {
    const { name, id } = row;
    const trimmedName = name.trim();
    let rowError: string | undefined;

    if (trimmedName === "") {
      errors.push({
        message: "Alternative name cannot be empty.",
        sources: [id],
      });
    } else if (trimmedName === mainName) {
      errors.push({
        message: "Alternative name cannot match the artist's main name.",
        sources: [id],
      });
    } else {
      seenNames.set(trimmedName, [...(seenNames.get(trimmedName) ?? []), id]);
    }

    normalizedRows.push({ ...row, name: trimmedName });

    if (trimmedName !== name) {
      notifications.push({
        message: "Note: value has been trimmed",
        sources: [id],
      });
    }

    if (rowError) {
      errors.push({
        message: rowError,
        sources: [id],
      });
    }
  }

  for (const [name, ids] of seenNames.entries()) {
    if (ids.length > 1) {
      errors.push({
        message: `Duplicate alternative name "${name}".`,
        sources: ids,
      });
    }
  }

  const valid = errors.length === 0;

  return valid
    ? {
        validatedValue: normalizedRows,
        notifications,
      }
    : {
        value: normalizedRows,
        errors,
        notifications,
      };
};
