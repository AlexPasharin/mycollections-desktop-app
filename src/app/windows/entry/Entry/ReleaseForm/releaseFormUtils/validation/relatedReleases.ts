import type { ReleaseFormRelatedReleasesErrors } from "../errorMessages";
import type {
  ReleaseFormRelatedReleaseRow,
  ValidReleaseFormRelatedReleaseRow,
} from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";

export const validateRelatedReleases = (
  rows: ReleaseFormRelatedReleaseRow[],
): FormFieldValidationResult<
  ValidReleaseFormRelatedReleaseRow[],
  ReleaseFormRelatedReleasesErrors,
  ReleaseFormRelatedReleaseRow[]
> => {
  const errors: ReleaseFormRelatedReleasesErrors = {};
  let valid = true;

  for (const row of rows) {
    if (row.relation === "") {
      valid = false;
      errors[row.id] = [
        { message: "Choose whether this release is a parent or a child." },
      ];
    }
  }

  if (!valid) {
    return {
      valid: false,
      value: rows,
      errorMessages: errors,
    };
  }

  return {
    valid: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    value: rows as ValidReleaseFormRelatedReleaseRow[], // checked-above
  };
};
