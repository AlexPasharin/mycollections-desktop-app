import type { EditEntryAltNamesErrors } from "../errorMessages";
import type { EditEntryAltNameRow } from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";

export const validateAltNames =
  (mainName: string) =>
  (
    rows: EditEntryAltNameRow[],
  ): FormFieldValidationResult<
    EditEntryAltNameRow[],
    EditEntryAltNamesErrors
  > => {
    const normalizedMainName = mainName.trim().toLowerCase();
    const seenNames = new Set<string>();
    const errors: EditEntryAltNamesErrors = {};

    let valid = true;

    const normalizedRows = rows.map((row) => ({
      ...row,
      name: row.name.trim(),
    }));

    for (const row of normalizedRows) {
      const { name } = row;
      const rowErrors = [];

      if (name === "") {
        rowErrors.push({ message: "Alternative name cannot be empty." });
      } else if (name.toLowerCase() === normalizedMainName) {
        rowErrors.push({
          message: "Alternative name can not match the main name of the entry.",
        });
      } else {
        const normalized = name.toLowerCase();

        if (seenNames.has(normalized)) {
          rowErrors.push({
            message: "Duplicate alternative name.",
          });
        } else {
          seenNames.add(normalized);
        }
      }

      if (rowErrors.length > 0) {
        valid = false;
        errors[row.id] = rowErrors;
      }
    }

    if (!valid) {
      return {
        valid: false,
        value: rows,
        errorMessages: errors,
      };
    }

    const hasTrimNotifications = rows.some(
      (row) => row.name !== row.name.trim(),
    );

    return {
      valid: true,
      value: normalizedRows,
      notifications: hasTrimNotifications
        ? [{ notification: "Note: alternative name have been trimmed" }]
        : undefined,
    };
  };
