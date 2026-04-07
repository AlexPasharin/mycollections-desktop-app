import { z } from "zod";

import type { GeneralizedDate } from "@/types/date";
import { parseGeneralizedDateString } from "@/utils/date";
import { createGeneralizedDateSchema } from "@/validation/generalizedDate";

const releaseVersionSchema = z
  .string()
  .trim()
  .min(1, "Release version is required");

/**
 * When the entry has a stored original release date string, parse and validate it as a
 * {@link GeneralizedDate}; if valid, release date validation uses it as `startDate` (see
 * {@link createGeneralizedDateSchema}).
 */
export const getReleaseDateStartFromOriginalReleaseDate = (
  originalReleaseDate: string | null | undefined,
): GeneralizedDate | undefined => {
  const parsed = parseGeneralizedDateString(originalReleaseDate);

  if (parsed === null) {
    return undefined;
  }

  const validated = createGeneralizedDateSchema().safeParse(parsed);

  return validated.success ? validated.data : undefined;
};

export const createAddReleaseFormSchema = (
  releaseDateStart?: GeneralizedDate,
) =>
  z.object({
    releaseVersion: releaseVersionSchema,
    releaseDate: createGeneralizedDateSchema(releaseDateStart).optional(),
  });
