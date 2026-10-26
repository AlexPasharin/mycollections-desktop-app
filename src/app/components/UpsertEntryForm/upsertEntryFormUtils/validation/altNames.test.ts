import { validateAltNames } from "./altNames";
import { formStateWith } from "./testUtils";

import type { UpsertEntryAltNameRow } from "../formValues";

const altNameRow = (
  id: string,
  name: string,
  nameId?: string,
): UpsertEntryAltNameRow => ({
  id,
  name,
  ...(nameId === undefined ? {} : { nameId }),
});

const validateForMainName = (rows: UpsertEntryAltNameRow[]) =>
  validateAltNames(
    formStateWith({ mainName: "  Bohemian Rhapsody  ", altNames: rows }),
  );

describe("validateAltNames", () => {
  it("accepts distinct alternative names and trims them", () => {
    const result = validateForMainName([
      altNameRow("row-1", "  Alt One  ", "name-1"),
      altNameRow("row-2", "Alt Two"),
    ]);

    expect(result.validatedValue).toEqual([
      { id: "row-1", name: "Alt One", nameId: "name-1" },
      { id: "row-2", name: "Alt Two" },
    ]);
    expect(result.notifications).toEqual([
      {
        message: "Note: alternative name have been trimmed",
        sources: ["row-1"],
      },
    ]);
  });

  it("accepts an empty list", () => {
    const result = validateForMainName([]);

    expect(result.validatedValue).toEqual([]);
    expect(result.errors).toBeUndefined();
  });

  it("rejects empty alternative names", () => {
    const result = validateForMainName([altNameRow("row-1", "   ")]);

    expect(result.errors).toEqual([
      { message: "Alternative name cannot be empty.", sources: ["row-1"] },
    ]);
  });

  it("rejects alternative names that match the main name", () => {
    const result = validateForMainName([
      altNameRow("row-1", "bohemian rhapsody"),
    ]);

    expect(result.errors).toEqual([
      {
        message: "Alternative name can not match the main name of the entry.",
        sources: ["row-1"],
      },
    ]);
  });

  it("rejects duplicate alternative names case-insensitively", () => {
    const result = validateForMainName([
      altNameRow("row-1", "Alternate Title"),
      altNameRow("row-2", "alternate title"),
    ]);

    expect(result.errors).toEqual([
      { message: "Duplicate alternative name.", sources: ["row-2"] },
    ]);
  });

  it("reports multiple row errors independently", () => {
    const result = validateForMainName([
      altNameRow("row-1", "Bohemian Rhapsody"),
      altNameRow("row-2", ""),
      altNameRow("row-3", "Duplicate"),
      altNameRow("row-4", "duplicate"),
    ]);

    expect(result.errors).toEqual([
      {
        message: "Alternative name can not match the main name of the entry.",
        sources: ["row-1"],
      },
      { message: "Alternative name cannot be empty.", sources: ["row-2"] },
      { message: "Duplicate alternative name.", sources: ["row-4"] },
    ]);
  });
});
