import { flattenError, z } from "zod";

export const getZodObjectFieldErrorMessage = <
  Shape extends z.core.$ZodLooseShape,
>(
  schema: z.ZodObject<Shape>,
  key: keyof Shape & string,
  value: unknown,
): string | null => {
  const fieldSchema = schema.shape[key] as z.ZodType;
  const result = fieldSchema.safeParse(value);

  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message ?? "Invalid input";
};

type ValidateAgainstSchemaResult<
  Schema extends z.ZodObject<z.core.$ZodLooseShape>,
> =
  | { success: true; data: z.output<Schema> }
  | {
      success: false;
      errorMessages: Partial<Record<string, { message: string }>>;
    };

/**
 * Like {@link z.ZodObject.safeParse}, but on failure returns a map of first messages per **top-level** shape key
 * (via {@link flattenError} `fieldErrors`). Nested paths only appear when Zod groups them under that key.
 */
export const validateAgainstSchema = <
  Schema extends z.ZodObject<z.core.$ZodLooseShape>,
>(
  schema: Schema,
  value: unknown,
): ValidateAgainstSchemaResult<Schema> => {
  const parsed = schema.safeParse(value);

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const { fieldErrors } = flattenError(parsed.error);
  const errorMessages: Partial<Record<string, { message: string }>> = {};
  const shapeKeys = Object.keys(schema.shape);

  for (const key of shapeKeys) {
    const first = fieldErrors[key]?.[0];

    if (first !== undefined) {
      errorMessages[key] = { message: first };
    }
  }

  return { success: false, errorMessages };
};
