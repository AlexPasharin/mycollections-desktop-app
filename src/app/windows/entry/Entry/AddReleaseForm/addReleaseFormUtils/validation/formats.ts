import type { FormFieldValidationResult } from "./types";

import type {
  AddReleaseFormFormatErrors,
  FormatFieldsRowId,
} from "../errorMessages";
import type { AddReleaseFormFormatInputs } from "../formValues";

import type { ReleasesFormatListItem } from "@/types/formats";
import type { ValidationResultErrorMessages } from "@/utils/validation";
import { addReleaseFormFormatInputArraySchema } from "@/validation/releases/addReleaseForm/formats";

export const validateReleaseFormats = (formats: ReleasesFormatListItem[]) => {
  const validationSchema = formatsSchema(formats);

  return (
    value: AddReleaseFormFormatInputs,
  ): FormFieldValidationResult<
    AddReleaseFormFormatInputs,
    AddReleaseFormFormatErrors
  > => {
    const validationResult = validationSchema.safeParse(value);

    if (!validationResult.success) {
      const errorMessages = getFormatsFormFieldErrors(
        validationResult.error.issues,
        value,
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

const formatsSchema = (formats: ReleasesFormatListItem[]) =>
  addReleaseFormFormatInputArraySchema(formats);

const getFormatsFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
  currentFormatInputValues: AddReleaseFormFormatInputs,
): AddReleaseFormFormatErrors => {
  type FormatErrorMessage = string;
  const errorMessagesMap: Record<
    FormatFieldsRowId,
    Record<FormatErrorMessage, PropertyKey[]>
  > = {};

  for (const { message, path } of errorMessages) {
    const rowIndex = path[0];
    const source = path[1];

    const filterRowById =
      typeof rowIndex === "number"
        ? currentFormatInputValues[rowIndex]
        : undefined;

    if (!filterRowById) {
      continue;
    }

    const mapEntry = errorMessagesMap[filterRowById.id] ?? {};
    const messageEntry = mapEntry[message] ?? [];

    if (source) {
      messageEntry.push(source);
    }

    mapEntry[message] = messageEntry;
    errorMessagesMap[filterRowById.id] = mapEntry;
  }

  const formatsErrorMessages: AddReleaseFormFormatErrors = {};

  for (const [rowId, messages] of Object.entries(errorMessagesMap)) {
    formatsErrorMessages[rowId] = Object.entries(messages).map(
      ([message, sources]) => ({
        message,
        sources,
      }),
    );
  }

  return formatsErrorMessages;
};
