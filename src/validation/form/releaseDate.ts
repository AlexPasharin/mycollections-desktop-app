import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { GeneralizedDate } from "@/types/date";
import type { FormValidationFnResult } from "@/types/form";
import { createGeneralizedDateSchema } from "@/validation";

export const validateReleaseDate = (
  value: GeneralizedDateFormInputValue,
  releaseDateStart?: GeneralizedDate | null,
): FormValidationFnResult<GeneralizedDateFormInputValue> => {
  const validationSchema = releaseDateSchema(releaseDateStart);
  const validationResult = validationSchema.safeParse(value);

  if (!validationResult.success) {
    type ReleaseDateErrorMessage = string;

    const errorMessageMap = validationResult.error.issues.reduce<
      Record<ReleaseDateErrorMessage, PropertyKey[]>
    >((acc, { message, path }) => {
      const mapEntry = acc[message] ?? [];
      const source = path[0];

      if (source) {
        mapEntry.push(source);
      }

      acc[message] = mapEntry;

      return acc;
    }, {});

    const errorMessages = Object.entries(errorMessageMap).map(
      ([message, sources]) => ({
        message,
        sources,
      }),
    );

    return {
      value,
      errors: errorMessages,
      notifications: [],
    };
  }

  return {
    validatedValue: {
      year: validationResult.data?.year?.toString() ?? "",
      month: validationResult.data?.month?.toString() ?? "",
      day: validationResult.data?.day?.toString() ?? "",
    },
    notifications: [],
  };
};

const releaseDateSchema = (releaseDateStart?: GeneralizedDate | null) =>
  createGeneralizedDateSchema(releaseDateStart).optional();
