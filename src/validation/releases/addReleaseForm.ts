import { z } from "zod";

import { addReleaseFormFormatInputArraySchema } from "./addReleaseFormFormats";

import type { GeneralizedDate } from "@/types/date";
import { createGeneralizedDateSchema } from "@/validation/generalizedDate";

const catalogueNumberLabelSlotSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const catalogueNumberSlotSchema = z.object({
  id: z.string(),
  value: z.string(),
});

const catalogueNumberRowSchema = z
  .object({
    id: z.string(),
    labelSlots: z.array(catalogueNumberLabelSlotSchema),
    catalogueNumberSlots: z.array(catalogueNumberSlotSchema),
  })
  .refine(
    (row) => row.labelSlots.length + row.catalogueNumberSlots.length >= 1,
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
