import type {
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
} from "../formValues";

import type { FormValidationFn } from "@/types/form";
import {
  validateRelatedItems,
  type ValidateRelatedItemsMessages,
} from "@/validation";

const relatedEntryMessages: ValidateRelatedItemsMessages = {
  invalidOrderNumber: "Child order number must be an integer greater than 0.",
  invalidRelatedId: "Entry ID must be a valid UUID.",
  trimmedRelatedId: (entryId: string) =>
    `Note: entry ID "${entryId}" has been trimmed`,
};

export const validateRelatedEntries: FormValidationFn<
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
  "relatedEntries"
> = (state) => {
  const rows = state.relatedEntries.value;

  const result = validateRelatedItems(rows, {
    getRelatedId: (row) => row.entryId,
    withRelatedId: (row, entryId) => ({ ...row, entryId }),
    messages: relatedEntryMessages,
  });

  const notifications = result.notifications;

  if (!result.valid) {
    return {
      value: result.value,
      errors: result.errorMessages ?? [],
      notifications,
    };
  }

  return {
    validatedValue: result.value,
    notifications,
  };
};
