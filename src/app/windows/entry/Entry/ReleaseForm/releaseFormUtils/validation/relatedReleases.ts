import type {
  ReleaseFormRelatedReleaseRow,
  ValidReleaseFormRelatedReleaseRow,
} from "../formValues";

import type { FormFieldError, FormFieldValidationResult } from "@/types/form";
import {
  validateRelatedItems,
  type ValidateRelatedItemsMessages,
} from "@/validation";

const relatedReleaseMessages: ValidateRelatedItemsMessages = {
  invalidRelatedId: "Release ID must be a valid UUID.",
  trimmedRelatedId: (releaseId: string) =>
    `Note: release ID "${releaseId}" has been trimmed`,
};

export const validateRelatedReleases = (
  rows: ReleaseFormRelatedReleaseRow[],
): FormFieldValidationResult<
  ValidReleaseFormRelatedReleaseRow[],
  FormFieldError[],
  ReleaseFormRelatedReleaseRow[]
> =>
  validateRelatedItems<ReleaseFormRelatedReleaseRow>(rows, {
    getRelatedId: (row) => row.releaseId,
    withRelatedId: (row, releaseId) => ({ ...row, releaseId }),
    messages: relatedReleaseMessages,
  });
