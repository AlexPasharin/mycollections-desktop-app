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
  const seenNames = new Set<string>();
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
    }

    if (mainName !== "" && trimmedName === mainName) {
      errors.push({
        message: "Alternative name cannot match the artist's main name.",
        sources: [id],
      });
    }

    if (seenNames.has(trimmedName)) {
      errors.push({
        message: `Duplicate alternative name "${trimmedName}".`,
        sources: [id],
      });
    } else if (trimmedName !== "") {
      seenNames.add(trimmedName);
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
