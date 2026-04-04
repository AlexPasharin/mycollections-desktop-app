import { flattenError, z, type ZodError } from "zod";

const schemaObj = {
  releaseVersion: z.string().trim().min(1, "Release version is required"),
};

export const addReleaseFormSchema = z.object(schemaObj);

export type AddReleaseFormInput = z.infer<typeof addReleaseFormSchema>;

export const addReleaseFormInitialValues: AddReleaseFormInput = {
  releaseVersion: "",
};

export type AddReleaseFormFieldKey = keyof AddReleaseFormInput;

// Single-field validation
export function getReleaseFormFieldErrorMessage<
  K extends AddReleaseFormFieldKey,
>(key: K, value: AddReleaseFormInput[K]): string | undefined {
  const result = addReleaseFormSchema.shape[key].safeParse(value);

  if (result.success) {
    return undefined;
  }

  return result.error.issues[0]?.message ?? "Invalid input";
}

// whole form validation
export function getReleaseFormFieldErrors(
  error: ZodError | undefined,
): Record<string, string> {
  if (error === undefined) {
    return {};
  }

  const fieldErrors: Record<string, string[]> = flattenError(error).fieldErrors;
  const out: Record<string, string> = {};

  for (const key in fieldErrors) {
    if (!(key in schemaObj)) {
      continue;
    }

    const first = fieldErrors[key]?.[0];

    if (first !== undefined) {
      out[key] = first;
    }
  }

  return out;
}
