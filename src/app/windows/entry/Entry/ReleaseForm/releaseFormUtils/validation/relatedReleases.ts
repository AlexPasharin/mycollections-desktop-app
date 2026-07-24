import type { ReleaseFormRelatedReleasesErrors } from "../errorMessages";
import type {
  ReleaseFormRelatedReleaseRow,
  ValidReleaseFormRelatedReleaseRow,
} from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";
import { validateRelatedItems } from "@/validation";

const relatedReleaseMessages = {
  missingRelation: "Choose whether this release is a parent or a child.",
  invalidRelatedId: "Release ID must be a valid UUID.",
  trimmedRelatedId: (releaseId: string) =>
    `Note: release ID "${releaseId}" has been trimmed`,
};

export const validateRelatedReleases = (
  rows: ReleaseFormRelatedReleaseRow[],
): FormFieldValidationResult<
  ValidReleaseFormRelatedReleaseRow[],
  ReleaseFormRelatedReleasesErrors,
  ReleaseFormRelatedReleaseRow[]
> =>
  validateRelatedItems<ReleaseFormRelatedReleaseRow>(rows, {
    getRelatedId: (row) => row.releaseId,
    withRelatedId: (row, releaseId) => ({ ...row, releaseId }),
    messages: relatedReleaseMessages,
  });
