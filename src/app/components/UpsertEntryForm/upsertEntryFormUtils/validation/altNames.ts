import type {
  UpsertEntryAltNameRow,
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
} from "../formValues";

import type {
  FormFeedbackMessages,
  FormValidationFn,
} from "@/hooks/useFormState";

export const validateAltNames: FormValidationFn<
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
  "altNames"
> = (state) => {
  const normalizedMainName = state.mainName.value.trim().toLowerCase();
  const seenNames = new Map<string, string[]>();
  const errors: FormFeedbackMessages = [];
  const notifications: FormFeedbackMessages = [];
  const normalizedRows: UpsertEntryAltNameRow[] = [];

  for (const row of state.altNames.value) {
    const { id } = row;
    const trimmedName = row.name.trim();
    const normalized = trimmedName.toLowerCase();

    if (trimmedName === "") {
      errors.push({
        message: "Alternative name cannot be empty.",
        sources: [id],
      });
    } else if (normalized === normalizedMainName) {
      errors.push({
        message: "Alternative name can not match the main name of the entry.",
        sources: [id],
      });
    } else {
      seenNames.set(normalized, [...(seenNames.get(normalized) ?? []), id]);
    }

    normalizedRows.push({ ...row, name: trimmedName });

    if (trimmedName !== row.name) {
      notifications.push({
        message: "Note: alternative name have been trimmed",
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

  if (errors.length > 0) {
    return {
      value: normalizedRows,
      errors,
      notifications,
    };
  }

  return {
    validatedValue: normalizedRows,
    notifications,
  };
};
