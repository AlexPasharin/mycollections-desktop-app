import { core, z } from "zod";

import { checkSequentialStringsSuffixNumberingValidity } from "../common";

const appendChildIssues = (
  ctx: core.$RefinementCtx<unknown>,
  issues: readonly core.$ZodIssue[],
): void => {
  for (const issue of issues) {
    ctx.addIssue({
      code: "custom",
      message: issue.message,
      path: issue.path,
    });
  }
};

const INVALID_OBJECT_KEYS_MESSAGE =
  "Value is invalid — is a json object but has wrong keys. Check documentation for which keys are allowed.";

const INVALID_VINYL_MATRIX_RUNOUT_KEYS_MESSAGE =
  "Invalid vinyl matrix/runout keys (see documentation for allowed combinations).";

const INVALID_MIXED_MATRIX_RUNOUT_VALUE_MESSAGE =
  "Invalid mixed matrix/runout value (see documentation for allowed values).";

/** String, or arbitrarily nested string-keyed objects whose leaves are all strings. */
export type StringLeafJson = string | { [key: string]: StringLeafJson };

const stringLeafJsonSchema: z.ZodType<StringLeafJson> = z.lazy(() =>
  z.union([z.string(), z.record(z.string(), stringLeafJsonSchema)]),
);

/** Allowed mixed-case format keys (matches extract_matrix_runout_jsonb_obj_keys).
 * "BD-A" has to be listed before "BD", so that "BD-A" is not matched as "BD" followed by an invalid suffix. */
const MIXED_KEY_REGEX = /^(?:CD|DVD|BD-A|BD|4HD_BD|3'CD|LP)(?:[1-9]\d*)?$/;

const LP_KEY_REGEX = /^LP(?:[1-9]\d*)?$/;

const mirroredCaseSchema = z.strictObject({
  mirrored: z.string(),
  normal: z.string().optional(),
});

const etchedObjectSchema = z.strictObject({
  etched: z.string(),
  stamped: z.string().optional(),
  comment: z.string().optional(),
});

const vinylKeyValueSchema = z.union([z.string(), etchedObjectSchema], {
  message: INVALID_OBJECT_KEYS_MESSAGE,
});

const classifyMatrixRunoutKey = (
  key: string,
): "mirrored" | "vinyl" | "mixed" | null => {
  if (key === "mirrored" || key === "normal") {
    return "mirrored";
  }

  if (
    /^Side [A-Z]$/.test(key) ||
    key === "Side AA" ||
    /^(Mono|Stereo) side$/.test(key) ||
    key === "Both A sides"
  ) {
    return "vinyl";
  }

  if (MIXED_KEY_REGEX.test(key)) {
    return "mixed";
  }

  return null;
};

/** Mirrors `validate_vinyl_keys` postgres function */
const validateVinylMatrixRunoutKeys = (vinylCaseKeys: string[]): boolean => {
  if (vinylCaseKeys.includes("Both A sides")) {
    return vinylCaseKeys.length === 1;
  }

  if (vinylCaseKeys.includes("Side AA")) {
    const set = new Set(vinylCaseKeys);

    return vinylCaseKeys.length === 2 && set.has("Side A");
  }

  if (
    vinylCaseKeys.includes("Mono side") ||
    vinylCaseKeys.includes("Stereo side")
  ) {
    const set = new Set(vinylCaseKeys);

    return (
      vinylCaseKeys.length === 2 &&
      set.has("Mono side") &&
      set.has("Stereo side")
    );
  }

  const hasSideA = vinylCaseKeys.some((k) => k === "Side A");
  const hasSideX = vinylCaseKeys.some((k) => k === "Side X");

  if (!hasSideA && !hasSideX) {
    return false;
  }

  const sideLetters: string[] = [];

  for (const k of vinylCaseKeys) {
    const m = k.match(/^Side ([A-Z])$/);

    const letter = m?.[1];

    // actually always true since we already checked for the regex match in the matrixRunoutObjectSchema schema definition
    if (letter) {
      sideLetters.push(letter);
    }
  }

  const distinctCodes = [
    ...new Set(sideLetters.map((c) => c.charCodeAt(0))),
  ].sort((a, b) => a - b);

  // distinctCodes should never be empty, so no null assertions below are justified

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const min = distinctCodes[0]!;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const max = distinctCodes[distinctCodes.length - 1]!;

  return max - min + 1 === distinctCodes.length;
};

/** Mirrors `validate_format_keys` postgres function */
const validateMixedMatrixRunoutKeys = (mixedCaseKeys: string[]): boolean => {
  const keysByFormatPrefix = new Map<string, string[]>();

  for (const key of mixedCaseKeys) {
    const formatPrefix = key.replace(/\d+$/, "");
    const formatKeys = keysByFormatPrefix.get(formatPrefix);

    if (formatKeys) {
      formatKeys.push(key);
    } else {
      keysByFormatPrefix.set(formatPrefix, [key]);
    }
  }

  return Array.from(keysByFormatPrefix.values()).every(
    checkSequentialStringsSuffixNumberingValidity,
  );
};

const vinylCaseSchema = z
  .record(z.string(), vinylKeyValueSchema)
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);

    if (!validateVinylMatrixRunoutKeys(keys)) {
      ctx.addIssue({
        code: "custom",
        message: INVALID_VINYL_MATRIX_RUNOUT_KEYS_MESSAGE,
      });
    }
  });

const mixedNonLpValueSchema = z.union([z.string(), mirroredCaseSchema], {
  message: INVALID_MIXED_MATRIX_RUNOUT_VALUE_MESSAGE,
});

const mixedCaseSchema = z
  .record(z.string(), stringLeafJsonSchema)
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);

    if (!validateMixedMatrixRunoutKeys(keys)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Invalid mixed matrix/runout keys (format key numbering rules).",
      });

      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const valueSchema = LP_KEY_REGEX.test(key)
        ? vinylCaseSchema
        : mixedNonLpValueSchema;

      const r = valueSchema.safeParse(value);

      if (!r.success) {
        appendChildIssues(ctx, r.error.issues);
      }
    }
  });

const matrixRunoutObjectSchema = z
  .record(z.string(), stringLeafJsonSchema)
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);

    let hasMirrored = false;
    let hasVinyl = false;
    let hasMixed = false;

    for (const key of keys) {
      const category = classifyMatrixRunoutKey(key);

      if (category === null) {
        ctx.addIssue({
          code: "custom",
          message: INVALID_OBJECT_KEYS_MESSAGE,
        });

        return;
      }

      if (category === "mirrored") {
        hasMirrored = true;
      } else if (category === "vinyl") {
        hasVinyl = true;
      } else {
        hasMixed = true;
      }
    }

    const mask =
      (hasMirrored ? 1 : 0) + (hasVinyl ? 2 : 0) + (hasMixed ? 4 : 0);

    const schema =
      mask === 1
        ? mirroredCaseSchema
        : mask === 2
          ? vinylCaseSchema
          : mask === 4
            ? mixedCaseSchema
            : null;

    if (schema) {
      const r = schema.safeParse(obj);

      if (!r.success) {
        appendChildIssues(ctx, r.error.issues);
      }

      return;
    }

    ctx.addIssue({
      code: "custom",
      message: INVALID_OBJECT_KEYS_MESSAGE,
    });
  });

// See documentation/database/validation_functions/release_matrix_runout_jsonb_validation.md
export const releaseMatrixRunoutSchema = z.union([
  z.null(),
  z.string(),
  matrixRunoutObjectSchema,
]);

export type ReleaseMatrixRunout = z.infer<typeof releaseMatrixRunoutSchema>;
