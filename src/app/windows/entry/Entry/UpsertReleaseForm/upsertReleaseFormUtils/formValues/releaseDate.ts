import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { GeneralizedDate, GeneralizedDateFromDb } from "@/types/date";
import { toValidCalendarDate } from "@/utils/date";

export const releaseDateToFormValue = (
  releaseDate: GeneralizedDateFromDb | undefined,
  originalReleaseDate: GeneralizedDate | null,
): GeneralizedDateFormInputValue => {
  const candidate =
    releaseDate === undefined ? originalReleaseDate : releaseDate;
  const date = isReleaseDateBeforeOriginal(candidate, originalReleaseDate)
    ? originalReleaseDate
    : candidate;

  if (date === null || "error" in date) {
    return { year: "", month: "", day: "" };
  }

  return {
    year: String(date.year ?? ""),
    month: String(date.month ?? ""),
    day: String(date.day ?? ""),
  };
};

/** Same bound idea as release-date validation: value upper bound vs start lower bound. */
const isReleaseDateBeforeOriginal = (
  releaseDate: GeneralizedDateFromDb | null,
  originalReleaseDate: GeneralizedDate | null,
): boolean => {
  if (
    originalReleaseDate === null ||
    releaseDate === null ||
    "error" in releaseDate
  ) {
    return false;
  }

  const releaseUpperBound = toValidCalendarDate(releaseDate, true);
  const originalLowerBound = toValidCalendarDate(originalReleaseDate, false);

  if (releaseUpperBound === null || originalLowerBound === null) {
    return false;
  }

  return releaseUpperBound.getTime() < originalLowerBound.getTime();
};
