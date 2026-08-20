import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { GeneralizedDateFromDb } from "@/types/date";

export const releaseDateToFormValue = (
  releaseDate: GeneralizedDateFromDb,
): GeneralizedDateFormInputValue => {
  if (releaseDate === null || "error" in releaseDate) {
    return { year: "", month: "", day: "" };
  }

  return {
    year: String(releaseDate.year ?? ""),
    month: String(releaseDate.month ?? ""),
    day: String(releaseDate.day ?? ""),
  };
};
