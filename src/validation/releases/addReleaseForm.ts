import { z } from "zod";

import { addReleaseFormFormatInputArraySchema } from "./addReleaseFormFormats";

import type { GeneralizedDate } from "@/types/date";
import { createGeneralizedDateSchema } from "@/validation/generalizedDate";

const catalogueNumberLabelInputValueSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const catalogueNumberInputValueSchema = z.object({
  id: z.string(),
  value: z.string(),
});

export const catalogueNumberRowSchema = z
  .object({
    id: z.string(),
    labelInputValues: z.array(catalogueNumberLabelInputValueSchema),
    catalogueNumberInputValues: z.array(catalogueNumberInputValueSchema),
  })
  .refine(
    (row) =>
      row.labelInputValues.length + row.catalogueNumberInputValues.length >= 1,
    {
      message:
        "Each catalogue row needs at least one label or catalogue number field",
    },
  );

const releaseVersionSchema = z
  .string()
  .trim()
  .min(1, "Release version is required");

export const createAddReleaseFormSchema = (
  releaseDateStart?: GeneralizedDate | null,
) =>
  z.object({
    releaseVersion: releaseVersionSchema,
    releaseDate: createGeneralizedDateSchema(releaseDateStart).optional(),
    formats: addReleaseFormFormatInputArraySchema,
    catalogueNumbers: z.array(catalogueNumberRowSchema),
  });
