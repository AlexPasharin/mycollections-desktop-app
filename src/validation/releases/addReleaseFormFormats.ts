import { z } from "zod";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import { strictStringToIntSchema } from "@/validation/common";

const AMOUNT_MIN_MESSAGE = "Amount must be at least 1.";

/** Integer ≥ 1, either as `z.int()` or as a string that parses to a base-10 integer. */
const addReleaseFormFormatAmountSchema = z
  .union([z.int(), z.string().trim().pipe(strictStringToIntSchema)])
  .pipe(z.int().min(1, { error: AMOUNT_MIN_MESSAGE }));

const addReleaseFormFormatInputSchema = z
  .strictObject({
    id: z.string().trim().min(1, "Id is required"),
    formatId: z.string().trim().min(1, "Format is required"),
    shortName: z.string().trim(),
    amount: addReleaseFormFormatAmountSchema,
    pictureSleeve: z.boolean(),
    jukeboxHole: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.jukeboxHole && val.shortName !== SEVEN_INCH_FORMAT_SHORT_NAME) {
      const message = `Short name must be "${SEVEN_INCH_FORMAT_SHORT_NAME}" when jukebox hole is true.`;

      ctx.addIssue({
        code: "custom",
        path: ["jukeboxHole"],
        message,
      });

      ctx.addIssue({
        code: "custom",
        path: ["shortName"],
        message,
      });
    }
  });

export const addReleaseFormFormatInputArraySchema = z
  .array(addReleaseFormFormatInputSchema)
  .nonempty()
  .superRefine((filterRows, ctx) => {
    const seenKeys = new Set<string>();
    let index = 0;

    for (const row of filterRows) {
      const key = similarFormatsRowKey(row);

      if (seenKeys.has(key)) {
        const message =
          "This format row is similar to a previously added one — same format, picture sleeve, and jukebox hole settings. Merge amounts or change options.";

        ctx.addIssue({
          code: "custom",
          path: [index],
          message,
        });

        return;
      }

      seenKeys.add(key);
      index += 1;
    }
  });

const similarFormatsRowKey = (row: {
  formatId: string;
  pictureSleeve: boolean;
  jukeboxHole: boolean;
}) =>
  JSON.stringify({
    formatId: row.formatId,
    pictureSleeve: row.pictureSleeve,
    jukeboxHole: row.jukeboxHole,
  });

// export type AddReleaseFormFormatInputValidated = z.infer<
//   typeof addReleaseFormFormatInputSchema
// >;

// export type AddReleaseFormFormatInputArrayValidated = z.infer<
//   typeof addReleaseFormFormatInputArraySchema
// >;
