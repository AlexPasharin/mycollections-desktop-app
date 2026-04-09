import { z } from "zod";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import { strictStringToIntSchema } from "@/validation/common";

const AMOUNT_MIN_MESSAGE = "Amount must be at least 1.";

/** Integer ≥ 1, either as `z.int()` or as a string that parses to a base-10 integer. */
const addReleaseFormFormatAmountSchema = z
  .union([z.int(), z.string().trim().pipe(strictStringToIntSchema)])
  .pipe(z.int().min(1, { error: AMOUNT_MIN_MESSAGE, abort: true }));

const addReleaseFormFormatInputSchema = z
  .strictObject({
    id: z.uuid({ error: "Row id must be a valid UUID." }),
    formatId: z.string().trim().min(1, "Format id is required"),
    shortName: z.string().trim().min(1, "Short name is required"),
    amount: addReleaseFormFormatAmountSchema,
    pictureSleeve: z.boolean(),
    jukeboxHole: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.jukeboxHole && val.shortName !== SEVEN_INCH_FORMAT_SHORT_NAME) {
      ctx.addIssue({
        code: "custom",
        path: ["jukeboxHole"],
        message: `Short name must be "${SEVEN_INCH_FORMAT_SHORT_NAME}" when jukebox hole is true.`,
      });
    }
  });

export const addReleaseFormFormatInputArraySchema = z
  .array(addReleaseFormFormatInputSchema)
  .nonempty()
  .superRefine((rows, ctx) => {
    const seenKeys = new Map<string, string>();

    for (const row of rows) {
      const key = similarFormatsRowKey(row);

      const firstId = seenKeys.get(key);

      if (firstId !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: [firstId],
          message: `Format rows with ids "${firstId}" and "${row.id}" are similar — same format, picture sleeve, and jukebox hole settings. Merge amounts or change options.`,
        });

        return;
      }

      seenKeys.set(key, row.id);
    }
  })
  .transform((rows) => rows.map(({ id: _rowId, ...rest }) => rest));

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
