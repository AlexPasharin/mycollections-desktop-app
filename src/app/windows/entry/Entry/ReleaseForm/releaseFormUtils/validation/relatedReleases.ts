import { validate as isValidUuid } from "uuid";

import type { ReleaseFormRelatedReleasesErrors } from "../errorMessages";
import type {
  ReleaseFormRelatedReleaseRow,
  ValidReleaseFormRelatedReleaseRow,
} from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";

const missingRelationError = {
  message: "Choose whether this release is a parent or a child.",
};

const invalidReleaseIdError = {
  message: "Release ID must be a valid UUID.",
};

export const validateRelatedReleases = (
  rows: ReleaseFormRelatedReleaseRow[],
): FormFieldValidationResult<
  ValidReleaseFormRelatedReleaseRow[],
  ReleaseFormRelatedReleasesErrors,
  ReleaseFormRelatedReleaseRow[]
> => {
  const errors: ReleaseFormRelatedReleasesErrors = {};
  const validatedRows: ReleaseFormRelatedReleaseRow[] = [];
  const notifications = [];
  let valid = true;

  for (const row of rows) {
    const rowErrors = [];
    const trimmedReleaseId = row.releaseId.trim();

    if (!isValidRelation(row.relation)) {
      rowErrors.push(missingRelationError);
    }

    if (!isValidUuid(trimmedReleaseId)) {
      rowErrors.push(invalidReleaseIdError);
    }

    if (rowErrors.length > 0) {
      valid = false;
      errors[row.id] = rowErrors;
    }

    validatedRows.push({
      ...row,
      releaseId: trimmedReleaseId,
      relation: row.relation,
    });

    if (trimmedReleaseId !== row.releaseId) {
      notifications.push(trimmedReleaseIdNotification(trimmedReleaseId));
    }
  }

  if (!valid) {
    return {
      valid: false,
      value: rows,
      errorMessages: errors,
      notifications: notifications.length > 0 ? notifications : undefined,
    };
  }

  return {
    valid: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    value: validatedRows as ValidReleaseFormRelatedReleaseRow[], // checked-above
    notifications: notifications.length > 0 ? notifications : undefined,
  };
};

const isValidRelation = (relation: ReleaseFormRelatedReleaseRow["relation"]) =>
  relation !== "";

const trimmedReleaseIdNotification = (releaseId: string) => ({
  notification: `Note: release ID "${releaseId}" has been trimmed`,
});
