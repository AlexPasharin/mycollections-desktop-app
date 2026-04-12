import { z } from "zod";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import { addCustomValidationIssues } from "@/utils/validation";
import { strictStringToIntSchema } from "@/validation/common";

const AMOUNT_MIN_MESSAGE = "Amount must be at least 1.";

/** Integer ≥ 1, either as `z.int()` or as a string that parses to a base-10 integer. */
const addReleaseFormFormatAmountSchema = z
  .union([z.int(), z.string().trim().pipe(strictStringToIntSchema)])
  .pipe(z.int().min(1, { error: AMOUNT_MIN_MESSAGE }));

const addReleaseFormFormatInputSchema = z
  .strictObject({
    id: z.string().trim().min(1, "Id is required"),
    formatId: z
      .string()
      .trim()
      .min(1, { message: "Format is required", abort: true }),
    shortName: z.string().trim(),
    amount: addReleaseFormFormatAmountSchema,
    pictureSleeve: z.boolean(),
    jukeboxHole: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.jukeboxHole && val.shortName !== SEVEN_INCH_FORMAT_SHORT_NAME) {
      const message = `Short name must be "${SEVEN_INCH_FORMAT_SHORT_NAME}" when jukebox hole is true.`;

      addCustomValidationIssues(ctx, message, ["jukeboxHole"], ["shortName"]);
    }
  });

export const addReleaseFormFormatInputArraySchema = z
  .array(addReleaseFormFormatInputSchema)
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
