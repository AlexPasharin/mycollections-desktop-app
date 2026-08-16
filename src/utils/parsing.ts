import { parse as parseYaml } from "yaml";

export const parseYAML = (value: string) => {
  try {
    const parsed = parseYaml(ensureSpaceAfterColonOutsideQuotes(value), {
      schema: "failsafe",
    }) as unknown;

    return { parsed };
  } catch (error) {
    console.error("Error parsing YAML:", error);

    return null;
  }
};

/**
 * Inserts a space after any `:` that is not already followed by whitespace,
 * unless that `:` occurs inside a single- or double-quoted YAML string. This
 * makes inputs like `CD:hello` or `{Side A:ABC,Side B:DEF}` parse as mappings.
 */
const ensureSpaceAfterColonOutsideQuotes = (input: string): string => {
  let out = "";
  let inDouble = false;
  let inSingle = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charAt(i);

    if (escapeNext) {
      out += ch;
      escapeNext = false;
      continue;
    }

    if (inDouble && ch === "\\") {
      out += ch;
      escapeNext = true;
      continue;
    }

    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
    } else if (!inDouble && ch === "'") {
      inSingle = !inSingle;
    }

    out += ch;

    if (ch === ":" && !inDouble && !inSingle) {
      const next = input.charAt(i + 1);

      if (next !== "" && !/\s/.test(next)) {
        out += " ";
      }
    }
  }

  return out;
};
