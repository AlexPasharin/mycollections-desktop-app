import { core, z } from "zod";

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

/** Allowed digital-format keys (matches extract_matrix_runout_jsonb_obj_keys). */
const DIGITAL_KEY_REGEX = /^(?:(?:CD|DVD|BD|4HD_BD)(?:[1-9]\d*)?|LP|3'CD)$/;

const mirroredCaseSchema = z.strictObject({
  mirrored: z.string(),
  normal: z.string().optional(),
});

const etchedObjectSchema = z.strictObject({
  etched: z.string(),
  stamped: z.string().optional(),
  comment: z.string().optional(),
});

const vinylKeyValueSchema = z.union([z.string(), etchedObjectSchema]);

const classifyMatrixRunoutKey = (
  key: string,
): "mirrored" | "vinyl" | "digital" | null => {
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

  if (DIGITAL_KEY_REGEX.test(key)) {
    return "digital";
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

/** Mirrors `check_digital_matrix_runout_keys` postgres function */
const checkDigitalMatrixRunoutKeys = (keys: string[]): boolean => {
  if (keys.length === 0) {
    return true;
  }

  const numbers = keys.map((k) => {
    const m = k.match(/^(CD|DVD|BD|4HD_BD)(\d*)$/);

    return m?.[2] ?? "";
  });

  // if key does not contain a number, it must be a single key
  if (numbers.some((n) => n === "")) {
    return keys.length === 1;
  }

  // otherwise numbers must be sequential, starting from 1, but not just only 1
  if (numbers.every((n) => n !== "1") || numbers.length === 1) {
    return false;
  }

  const max = Math.max(...numbers.map((n) => Number.parseInt(n, 10)));

  return max === numbers.length;
};

/** Mirrors `validate_digital_keys` postgres function */
const validateDigitalMatrixRunoutKeys = (
  digitalCaseKeys: string[],
): boolean => {
  const cdKeys: string[] = [];
  const dvdKeys: string[] = [];
  const bdKeys: string[] = [];
  const hdBdKeys: string[] = [];

  for (const key of digitalCaseKeys) {
    if (/^CD\d*$/.test(key)) {
      cdKeys.push(key);
    } else if (/^DVD\d*$/.test(key)) {
      dvdKeys.push(key);
    } else if (/^BD\d*$/.test(key)) {
      bdKeys.push(key);
    } else if (/^4HD_BD\d*$/.test(key)) {
      hdBdKeys.push(key);
    }
  }

  return (
    checkDigitalMatrixRunoutKeys(cdKeys) &&
    checkDigitalMatrixRunoutKeys(dvdKeys) &&
    checkDigitalMatrixRunoutKeys(bdKeys) &&
    checkDigitalMatrixRunoutKeys(hdBdKeys)
  );
};

const vinylCaseSchema = z
  .record(z.string(), vinylKeyValueSchema)
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);

    if (!validateVinylMatrixRunoutKeys(keys)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Invalid vinyl matrix/runout keys (see documentation for allowed combinations).",
      });
    }
  });

const digitalNonLpValueSchema = z.union([z.string(), mirroredCaseSchema]);

const digitalCaseSchema = z
  .record(z.string(), z.unknown())
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);

    if (!validateDigitalMatrixRunoutKeys(keys)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Invalid digital matrix/runout keys (CD/DVD/BD/4HD_BD numbering rules).",
      });

      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const valueSchema =
        key === "LP" ? vinylCaseSchema : digitalNonLpValueSchema;

      const r = valueSchema.safeParse(value);

      if (!r.success) {
        appendChildIssues(ctx, r.error.issues);
      }
    }
  });

const matrixRunoutObjectSchema = z
  .record(z.string(), z.unknown())
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);

    let hasMirrored = false;
    let hasVinyl = false;
    let hasDigital = false;

    for (const key of keys) {
      const category = classifyMatrixRunoutKey(key);

      if (category === null) {
        ctx.addIssue({
          code: "custom",
          message:
            "Value is invalid — object has disallowed keys. Check documentation for which keys are allowed.",
        });

        return;
      }

      if (category === "mirrored") {
        hasMirrored = true;
      } else if (category === "vinyl") {
        hasVinyl = true;
      } else {
        hasDigital = true;
      }
    }

    const mask =
      (hasMirrored ? 1 : 0) + (hasVinyl ? 2 : 0) + (hasDigital ? 4 : 0);

    const schema =
      mask === 1
        ? mirroredCaseSchema
        : mask === 2
          ? vinylCaseSchema
          : mask === 4
            ? digitalCaseSchema
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
      message:
        "Value is invalid — is a json object but has wrong keys. Check documentation for which keys are allowed.",
    });
  });

// See documentation/database/validation_functions/release_matrix_runout_jsonb_validation.md
export const releaseMatrixRunoutSchema = z.union([
  z.null(),
  z.string(),
  matrixRunoutObjectSchema,
]);

export type ReleaseMatrixRunout = z.infer<typeof releaseMatrixRunoutSchema>;
export type MatrixRunoutVinylCase = z.infer<typeof vinylCaseSchema>;
export type MatrixRunoutDigitalCase = z.infer<typeof digitalCaseSchema>;
