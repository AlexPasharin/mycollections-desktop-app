import { z } from "zod";

import { catalogueNumberRowSchema } from "./catNumbers";
import { addReleaseFormCountriesSchema } from "./countries";
import { addReleaseFormFormatInputArraySchema } from "./formats";

import type { ReleasesFormatListItem } from "@/types/formats";
import { releaseMatrixRunoutSchema } from "@/validation/releases/matrixRunout";

export { catalogueNumberRowSchema, addReleaseFormCountriesSchema };

const matrixRunoutSchema = z
  .object({
    value: z.string().trim(),
    treatAsText: z.boolean(),
  })
  .transform((input, ctx) => {
    const { value, treatAsText } = input;

    if (value === "") {
      return null;
    }

    if (treatAsText) {
      return value;
    }

    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({
        code: "custom",
        message:
          "Matrix / runout must be empty, plain text or valid JSON object. if you want it to be plain text, check the 'treat as plain text, not json object' checkbox.",
      });

      return z.NEVER;
    }
  })
  .pipe(releaseMatrixRunoutSchema);

export const createAddReleaseFormSchema = (formats: ReleasesFormatListItem[]) =>
  z.object({
    matrixRunout: matrixRunoutSchema,
    formats: addReleaseFormFormatInputArraySchema(formats),
    catalogueNumbers: z.array(catalogueNumberRowSchema).optional(),
    countries: addReleaseFormCountriesSchema,
  });
