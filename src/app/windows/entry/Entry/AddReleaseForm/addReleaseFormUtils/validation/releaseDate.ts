import type { FormFieldValidationResult } from "./types";

import type { AddReleaseFormFieldError } from "../errorMessages";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { GeneralizedDate } from "@/types/date";
import { createGeneralizedDateSchema } from "@/validation/generalizedDate";

export const validateReleaseDate = (
  releaseDateStart?: GeneralizedDate | null,
) => {
  const validationSchema = releaseDateSchema(releaseDateStart);

  return (
    value: GeneralizedDateFormInputValue,
  ): FormFieldValidationResult<
    GeneralizedDateFormInputValue,
    AddReleaseFormFieldError[]
  > => {
    const validationResult = validationSchema.safeParse(value);

    if (!validationResult.success) {
      type ReleaseDateErrorMessage = string;

      const errorMessageMap = validationResult.error.issues.reduce<
        Record<ReleaseDateErrorMessage, PropertyKey[]>
      >((acc, { message, path }) => {
        const mapEntry = acc[message] ?? [];
        const source = path[0];

        if (source) {
          mapEntry.push(source);
        }

        acc[message] = mapEntry;

        return acc;
      }, {});

      const errorMessages = Object.entries(errorMessageMap).map(
        ([message, sources]) => ({
          message,
          sources,
        }),
      );

      return {
        valid: false,
        value,
        errorMessages,
      };
    }

    return {
      valid: true,
      value,
    };
  };
};

const releaseDateSchema = (releaseDateStart?: GeneralizedDate | null) =>
  createGeneralizedDateSchema(releaseDateStart).optional();
