import type { UpsertEntryRelatedEntriesErrors } from "../errorMessages";
import type {
  UpsertEntryRelatedEntryRow,
  ValidUpsertEntryRelatedEntryRow,
} from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";
import { validateRelatedItems } from "@/validation";

const relatedEntryMessages = {
  missingRelation: "Choose whether this entry is a parent or a child.",
  invalidRelatedId: "Entry ID must be a valid UUID.",
  trimmedRelatedId: (entryId: string) =>
    `Note: entry ID "${entryId}" has been trimmed`,
};

export const validateRelatedEntries = (
  rows: UpsertEntryRelatedEntryRow[],
): FormFieldValidationResult<
  ValidUpsertEntryRelatedEntryRow[],
  UpsertEntryRelatedEntriesErrors,
  UpsertEntryRelatedEntryRow[]
> =>
  validateRelatedItems<UpsertEntryRelatedEntryRow>(rows, {
    getRelatedId: (row) => row.entryId,
    withRelatedId: (row, entryId) => ({ ...row, entryId }),
    messages: relatedEntryMessages,
  });
