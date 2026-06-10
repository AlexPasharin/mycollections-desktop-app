import { validateAltNames } from "./altNames";

import type { EditEntryAltNameRow } from "../formValues";

const altNameRow = (
  id: string,
  name: string,
  nameId?: string,
): EditEntryAltNameRow => ({
  id,
  name,
  ...(nameId === undefined ? {} : { nameId }),
});

describe("validateAltNames", () => {
  const validateForMainName = validateAltNames("  Bohemian Rhapsody  ");

  it("accepts distinct alternative names and trims them", () => {
    expect(
      validateForMainName([
        altNameRow("row-1", "  Alt One  ", "name-1"),
        altNameRow("row-2", "Alt Two"),
      ]),
    ).toEqual({
      valid: true,
      value: [
        { id: "row-1", name: "Alt One", nameId: "name-1" },
        { id: "row-2", name: "Alt Two" },
      ],
      notifications: [
        { notification: "Note: alternative name have been trimmed" },
      ],
    });
  });

  it("accepts an empty list", () => {
    expect(validateForMainName([])).toEqual({
      valid: true,
      value: [],
      notifications: undefined,
    });
  });

  it("rejects empty alternative names", () => {
    const rows = [altNameRow("row-1", "   ")];

    expect(validateForMainName(rows)).toEqual({
      valid: false,
      value: rows,
      errorMessages: {
        "row-1": [{ message: "Alternative name cannot be empty." }],
      },
    });
  });

  it("rejects alternative names that match the main name", () => {
    const rows = [altNameRow("row-1", "bohemian rhapsody")];

    expect(validateForMainName(rows)).toEqual({
      valid: false,
      value: rows,
      errorMessages: {
        "row-1": [
          {
            message:
              "Alternative name can not match the main name of the entry.",
          },
        ],
      },
    });
  });

  it("rejects duplicate alternative names case-insensitively", () => {
    const rows = [
      altNameRow("row-1", "Alternate Title"),
      altNameRow("row-2", "alternate title"),
    ];

    expect(validateForMainName(rows)).toEqual({
      valid: false,
      value: rows,
      errorMessages: {
        "row-2": [{ message: "Duplicate alternative name." }],
      },
    });
  });

  it("reports multiple row errors independently", () => {
    const rows = [
      altNameRow("row-1", "Bohemian Rhapsody"),
      altNameRow("row-2", ""),
      altNameRow("row-3", "Duplicate"),
      altNameRow("row-4", "duplicate"),
    ];

    expect(validateForMainName(rows)).toEqual({
      valid: false,
      value: rows,
      errorMessages: {
        "row-1": [
          {
            message:
              "Alternative name can not match the main name of the entry.",
          },
        ],
        "row-2": [{ message: "Alternative name cannot be empty." }],
        "row-4": [{ message: "Duplicate alternative name." }],
      },
    });
  });
});
