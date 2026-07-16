import type { ArtistUpsertAltNameRow } from "../formValues";

import type { FormFieldError, FormFieldValidationResult } from "@/types/form";

export const validateArtistAltNames =
  (mainName: string) =>
  (
    rows: ArtistUpsertAltNameRow[],
  ): FormFieldValidationResult<ArtistUpsertAltNameRow[]> => {
    const seenNames = new Set<string>();
    const errors: FormFieldError[] = [];

    const normalizedRows: ArtistUpsertAltNameRow[] = [];
    const notifications = [];

    for (const row of rows) {
      const { name } = row;
      const trimmedName = name.trim();
      let rowError: string | undefined;

      if (trimmedName === "") {
        rowError = "Alternative name cannot be empty.";
      } else if (trimmedName === mainName) {
        rowError = "Alternative name cannot match the artist's main name.";
      } else if (seenNames.has(trimmedName)) {
        rowError = "Duplicate alternative name.";
      } else {
        seenNames.add(trimmedName);
        normalizedRows.push({ ...row, name: trimmedName });

        if (trimmedName !== name) {
          notifications.push({
            notification: "Note: alternative name has been trimmed",
          });
        }
      }

      if (rowError) {
        errors.push({ message: rowError, sources: [row.id] });
      }
    }

    const valid = errors.length === 0;

    return valid
      ? {
          valid,
          value: normalizedRows,
          notifications,
        }
      : {
          valid: false,
          value: normalizedRows,
          errorMessages: errors,
          notifications,
        };
  };
