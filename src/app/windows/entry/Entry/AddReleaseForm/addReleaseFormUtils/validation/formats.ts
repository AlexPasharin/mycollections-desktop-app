import { z } from "zod";

import type { FormFieldValidationResult } from "./types";

import type {
  AddReleaseFormFormatErrors,
  FormatFieldsRowId,
} from "../errorMessages";
import type { AddReleaseFormFormatInputs } from "../formValues";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { ReleasesFormatListItem } from "@/types/formats";
import {
  addCustomValidationIssues,
  type ValidationResultErrorMessages,
} from "@/utils/validation";
import { strictStringToIntSchema } from "@/validation/common";

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

const addReleaseFormFormatInputArraySchema = (
  formats: ReleasesFormatListItem[],
) =>
  z
    .array(addReleaseFormFormatInputSchema(formats))
    .nonempty()
    .superRefine((filterRows, ctx) => {
      const seenKeys = new Set<string>();
      let index = 0;

      for (const row of filterRows) {
        const { formatId, pictureSleeve, jukeboxHole } = row;
        const key = JSON.stringify({ formatId, pictureSleeve, jukeboxHole });

        if (seenKeys.has(key)) {
          const message =
            "This format row is similar to a previously added one — same format, picture sleeve, and jukebox hole settings. Merge amounts or change options.";

          addCustomValidationIssues(
            ctx,
            message,
            [index, "formatId"],
            [index, "pictureSleeve"],
            [index, "jukeboxHole"],
          );
        } else {
          seenKeys.add(key);
        }

        index += 1;
      }
    });

const AMOUNT_MIN_MESSAGE = "Amount must be at least 1.";

/** Integer ≥ 1, either as `z.int()` or as a string that parses to a base-10 integer. */
const addReleaseFormFormatAmountSchema = z
  .union([z.int(), z.string().trim().pipe(strictStringToIntSchema)])
  .pipe(z.int().min(1, { error: AMOUNT_MIN_MESSAGE }));

const addReleaseFormFormatInputSchema = (formats: ReleasesFormatListItem[]) => {
  const sevenInchFormat = formats.find(
    (f) => f.shortName === SEVEN_INCH_FORMAT_SHORT_NAME,
  );

  return z
    .object({
      id: z.string(),
      formatId: z
        .string()
        .trim()
        .min(1, { message: "Format is required", abort: true }),
      amount: addReleaseFormFormatAmountSchema,
      pictureSleeve: z.boolean(),
      jukeboxHole: z.boolean(),
    })
    .superRefine((val, ctx) => {
      if (val.jukeboxHole && val.formatId !== sevenInchFormat?.formatId) {
        const message = `Short name must be "${sevenInchFormat?.shortName ?? SEVEN_INCH_FORMAT_SHORT_NAME}" when jukebox hole is true.`;

        addCustomValidationIssues(ctx, message, ["jukeboxHole"], ["formatId"]);
      }
    });
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
