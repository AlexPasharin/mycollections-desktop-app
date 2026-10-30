import { z } from "zod";

import type { ReleaseFormFormatInputs } from "../formValues/formats";
import type {
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
} from "../formValues/formState";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type {
  FormValidationFn,
  FormFeedbackMessages,
} from "@/hooks/useFormState";
import type { ReleasesFormatListItem } from "@/types/formats";
import {
  addCustomValidationIssues,
  type ValidationResultErrorMessages,
} from "@/utils/validation";
import { strictStringToIntSchema } from "@/validation";

export const validateReleaseFormats = (
  formats: ReleasesFormatListItem[],
): FormValidationFn<ReleaseFormDraft, ValidatedReleaseFormDraft, "formats"> => {
  const validationSchema = releaseFormFormatInputArraySchema(formats);

  return (state) => {
    const value = state.formats.value;
    const validationResult = validationSchema.safeParse(value);

    if (!validationResult.success) {
      return {
        value,
        errors: getFormatsFeedbackMessages(
          validationResult.error.issues,
          value,
        ),
        notifications: [],
      };
    }

    return {
      validatedValue: value,
      notifications: [],
    };
  };
};

const releaseFormFormatInputArraySchema = (formats: ReleasesFormatListItem[]) =>
  z
    .array(releaseFormFormatInputSchema(formats))
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
const releaseFormFormatAmountSchema = z
  .union([z.int(), z.string().trim().pipe(strictStringToIntSchema)])
  .pipe(z.int().min(1, { error: AMOUNT_MIN_MESSAGE }));

const releaseFormFormatInputSchema = (formats: ReleasesFormatListItem[]) => {
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
      amount: releaseFormFormatAmountSchema,
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

const getFormatsFeedbackMessages = (
  errorMessages: ValidationResultErrorMessages,
  currentFormatInputValues: ReleaseFormFormatInputs,
): FormFeedbackMessages =>
  errorMessages.flatMap(({ message, path }) => {
    const rowIndex = path[0];
    const source = path[1];

    const row =
      typeof rowIndex === "number"
        ? currentFormatInputValues[rowIndex]
        : undefined;

    if (!row) {
      return [];
    }

    return [{ message, sources: source ? [row.id, source] : [row.id] }];
  });
