import { core, z } from "zod";

export const addCustomValidationIssues = (
  ctx: core.$RefinementCtx<unknown>,
  message: string,
  ...paths: PropertyKey[][]
) => {
  if (paths.length === 0) {
    ctx.addIssue({ code: "custom", message });

    return;
  }

  for (const path of paths) {
    ctx.addIssue({
      code: "custom",
      message,
      path,
    });
  }
};

export type ValidationResultErrorMessages = {
  message: string;
  path: PropertyKey[];
}[];

export const getFieldValidationErrorMessages = (
  schema: z.ZodType,
  value: unknown,
  key?: string,
): ValidationResultErrorMessages | undefined => {
  let validationSchema: z.ZodType;

  if (key === undefined) {
    validationSchema = schema;
  } else {
    if (!(schema instanceof z.ZodObject)) {
      throw new Error(`Schema is not an object for key: ${key}`);
    }

    const shape = schema.shape as Record<string, z.ZodType>;

    const fieldSchema = shape[key];

    if (fieldSchema === undefined) {
      throw new Error(`Field schema not found for key: ${key}`);
    }

    validationSchema = fieldSchema;
  }

  const result = validationSchema.safeParse(value);

  return validationResultErrorMessagesFromSafeParseResult(result, key);
};

type ValidateAgainstSchemaResult<
  Schema extends z.ZodObject<z.core.$ZodLooseShape>,
> =
  | { success: true; data: z.output<Schema> }
  | {
      success: false;
      errorMessages: ValidationResultErrorMessages;
    };

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

  return {
    success: false,
    errorMessages: validationResultErrorMessagesFromSafeParseResult(parsed),
  };
};

function validationResultErrorMessagesFromSafeParseResult(
  result: z.ZodSafeParseError<unknown>,
  key?: string,
): ValidationResultErrorMessages;

function validationResultErrorMessagesFromSafeParseResult(
  result: z.ZodSafeParseResult<unknown>,
  key?: string,
): ValidationResultErrorMessages | undefined;

function validationResultErrorMessagesFromSafeParseResult(
  result: z.ZodSafeParseResult<unknown>,
  key?: string,
): ValidationResultErrorMessages | undefined {
  return result.error?.issues.map(({ message, path }) => ({
    message,
    path: key === undefined ? path : [key, ...path],
  }));
}
