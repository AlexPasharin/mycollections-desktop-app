import { validateRelatedEntries } from "./relatedEntries";

import type { UpsertEntryRelatedEntryRow } from "../formValues";

const relatedEntryRow = (
  id: string,
  entryId: string,
  relation: UpsertEntryRelatedEntryRow["relation"],
): UpsertEntryRelatedEntryRow => ({
  id,
  entryId,
  relation,
});

const parentEntryId = "11111111-1111-4111-8111-111111111111";
const childEntryId = "22222222-2222-4222-8222-222222222222";

describe("validateRelatedEntries", () => {
  it("accepts parent and child rows with valid entry ids", () => {
    expect(
      validateRelatedEntries([
        relatedEntryRow("row-1", parentEntryId, "parent"),
        relatedEntryRow("row-2", childEntryId, "child"),
      ]),
    ).toEqual({
      valid: true,
      value: [
        relatedEntryRow("row-1", parentEntryId, "parent"),
        relatedEntryRow("row-2", childEntryId, "child"),
      ],
    });
  });

  it("trims entry ids in the validated value", () => {
    expect(
      validateRelatedEntries([
        relatedEntryRow("row-1", `  ${parentEntryId}  `, "parent"),
      ]),
    ).toEqual({
      valid: true,
      value: [relatedEntryRow("row-1", parentEntryId, "parent")],
      notifications: [
        {
          notification: `Note: entry ID "${parentEntryId}" has been trimmed`,
        },
      ],
    });
  });

  it("reports missing relations and invalid entry ids per row", () => {
    const result = validateRelatedEntries([
      relatedEntryRow("row-1", "not-a-uuid", ""),
      relatedEntryRow("row-2", childEntryId, "parent"),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual({
      "row-1": [
        { message: "Choose whether this entry is a parent or a child." },
        { message: "Entry ID must be a valid UUID." },
      ],
    });
  });
});
