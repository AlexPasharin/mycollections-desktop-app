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

export const getFieldValidationErrorMessages = <
  Shape extends z.core.$ZodLooseShape,
>(
  schema: z.ZodObject<Shape>,
  value: unknown,
  key?: keyof Shape & string,
): ValidationResultErrorMessages | undefined => {
  const fieldSchema = key ? (schema.shape[key] as z.ZodType) : schema;
  const result = fieldSchema.safeParse(value);

  return result.error?.issues.map(({ message, path }) => ({
    message,
    path: key ? [key, ...path] : path,
  }));
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
    errorMessages: parsed.error.issues.map(({ message, path }) => ({
      message,
      path,
    })),
  };
};
