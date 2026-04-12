import { z } from "zod";

import { addReleaseFormFormatInputArraySchema } from "./addReleaseFormFormats";

import type { GeneralizedDate } from "@/types/date";
import { createGeneralizedDateSchema } from "@/validation/generalizedDate";

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
  });
