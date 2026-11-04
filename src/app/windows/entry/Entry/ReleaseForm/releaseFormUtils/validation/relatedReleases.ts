import type {
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
} from "../formValues/formState";

import type { FormValidationFn } from "@/types/form";
import {
  validateRelatedItems,
  type ValidateRelatedItemsMessages,
} from "@/validation";

const relatedReleaseMessages: ValidateRelatedItemsMessages = {
  invalidRelatedId: "Release ID must be a valid UUID.",
  trimmedRelatedId: (releaseId: string) =>
    `Note: release ID "${releaseId}" has been trimmed`,
};

export const validateRelatedReleases: FormValidationFn<
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
  "relatedReleases"
> = (state) => {
  const rows = state.relatedReleases.value;

  const result = validateRelatedItems(rows, {
    getRelatedId: (row) => row.releaseId,
    withRelatedId: (row, releaseId) => ({ ...row, releaseId }),
    messages: relatedReleaseMessages,
  });

  const notifications = result.notifications ?? [];

  if (!result.valid) {
    return {
      value: result.value,
      errors: result.errorMessages,
      notifications,
    };
  }

  return {
    validatedValue: result.value,
    notifications,
  };
};
