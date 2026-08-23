import { validateRelatedEntries } from "./relatedEntries";

import type { UpsertEntryRelatedEntryRow } from "../formValues";

import type { RelatedItemRelation } from "@/types/common";

const relatedEntryRow = (
  id: string,
  entryId: string,
  relation: RelatedItemRelation,
  orderNumber: string,
): UpsertEntryRelatedEntryRow => ({
  id,
  entryId,
  relation,
  orderNumber,
});

const parentEntryId = "11111111-1111-4111-8111-111111111111";
const childEntryId = "22222222-2222-4222-8222-222222222222";
const childEntryId2 = "33333333-3333-4333-8333-333333333333";

const trimmedEntryIdNotification = (entryId: string) => ({
  notification: `Note: entry ID "${entryId}" has been trimmed`,
});

describe("validateRelatedEntries", () => {
  it("accepts parent and child rows with valid entry ids", () => {
    expect(
      validateRelatedEntries([
        relatedEntryRow("row-1", parentEntryId, "parent", "1"),
        relatedEntryRow("row-2", childEntryId, "child", "1"),
      ]),
    ).toEqual({
      valid: true,
      value: [
        relatedEntryRow("row-1", parentEntryId, "parent", "1"),
        relatedEntryRow("row-2", childEntryId, "child", "1"),
      ],
    });
  });

  it("trims entry ids in the validated value", () => {
    expect(
      validateRelatedEntries([
        relatedEntryRow("row-1", `  ${parentEntryId}  `, "parent", "1"),
      ]),
    ).toEqual({
      valid: true,
      value: [relatedEntryRow("row-1", parentEntryId, "parent", "1")],
      notifications: [trimmedEntryIdNotification(parentEntryId)],
    });
  });

  it("emits one trim notification per trimmed entry id", () => {
    const result = validateRelatedEntries([
      relatedEntryRow("row-1", `  ${parentEntryId}  `, "parent", "1"),
      relatedEntryRow("row-2", childEntryId, "child", "1"),
      relatedEntryRow("row-3", ` ${childEntryId2} `, "child", "2"),
    ]);

    expect(result).toEqual({
      valid: true,
      value: [
        relatedEntryRow("row-1", parentEntryId, "parent", "1"),
        relatedEntryRow("row-2", childEntryId, "child", "1"),
        relatedEntryRow("row-3", childEntryId2, "child", "2"),
      ],
      notifications: [
        trimmedEntryIdNotification(parentEntryId),
        trimmedEntryIdNotification(childEntryId2),
      ],
    });
  });

  it("requires a valid uuid entry id on every row", () => {
    const result = validateRelatedEntries([
      relatedEntryRow("row-1", "not-a-uuid", "child", "1"),
      relatedEntryRow("row-2", childEntryId, "parent", "1"),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual([
      { message: "Entry ID must be a valid UUID.", sources: ["row-1"] },
    ]);
  });

  it("requires child order number to be an integer greater than 0", () => {
    const result = validateRelatedEntries([
      relatedEntryRow("row-1", parentEntryId, "parent", "0"),
      relatedEntryRow("row-2", childEntryId, "child", "1.5"),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual([
      {
        message: "Child order number must be an integer greater than 0.",
        sources: ["row-1"],
      },
      {
        message: "Child order number must be an integer greater than 0.",
        sources: ["row-2"],
      },
    ]);
  });

  it("reports duplicate entry ids across rows", () => {
    const result = validateRelatedEntries([
      relatedEntryRow("row-1", parentEntryId, "parent", "1"),
      relatedEntryRow("row-2", childEntryId, "child", "1"),
      relatedEntryRow("row-3", childEntryId, "child", "2"),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual([
      {
        message: `Duplicate uuid "${childEntryId}" used by multiple rows.`,
        sources: ["row-2", "row-3"],
      },
    ]);
  });

  it("requires child order numbers to be sequential starting from 1", () => {
    const result = validateRelatedEntries([
      relatedEntryRow("row-1", parentEntryId, "parent", "1"),
      relatedEntryRow("row-2", childEntryId, "child", "2"),
      relatedEntryRow("row-3", childEntryId2, "child", "3"),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual([
      {
        message: "Child order numbers must be sequential starting from 1.",
      },
    ]);
  });
});
