import { validateRelatedEntries } from "./relatedEntries";
import { formStateWith } from "./testUtils";

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

const validateRows = (rows: UpsertEntryRelatedEntryRow[]) =>
  validateRelatedEntries(formStateWith({ relatedEntries: rows }));

const parentEntryId = "11111111-1111-4111-8111-111111111111";
const childEntryId = "22222222-2222-4222-8222-222222222222";
const childEntryId2 = "33333333-3333-4333-8333-333333333333";

const trimmedEntryIdNotification = (rowId: string, entryId: string) => ({
  message: `Note: entry ID "${entryId}" has been trimmed`,
  sources: [rowId, "id"],
});

describe("validateRelatedEntries", () => {
  it("accepts parent and child rows with valid entry ids", () => {
    const result = validateRows([
      relatedEntryRow("row-1", parentEntryId, "parent", "1"),
      relatedEntryRow("row-2", childEntryId, "child", "1"),
    ]);

    expect(result.validatedValue).toEqual([
      relatedEntryRow("row-1", parentEntryId, "parent", "1"),
      relatedEntryRow("row-2", childEntryId, "child", "1"),
    ]);
    expect(result.notifications).toEqual([]);
  });

  it("trims entry ids in the validated value", () => {
    const result = validateRows([
      relatedEntryRow("row-1", `  ${parentEntryId}  `, "parent", "1"),
    ]);

    expect(result.validatedValue).toEqual([
      relatedEntryRow("row-1", parentEntryId, "parent", "1"),
    ]);
    expect(result.notifications).toEqual([
      trimmedEntryIdNotification("row-1", parentEntryId),
    ]);
  });

  it("emits one trim notification per trimmed entry id", () => {
    const result = validateRows([
      relatedEntryRow("row-1", `  ${parentEntryId}  `, "parent", "1"),
      relatedEntryRow("row-2", childEntryId, "child", "1"),
      relatedEntryRow("row-3", ` ${childEntryId2} `, "child", "2"),
    ]);

    expect(result.validatedValue).toEqual([
      relatedEntryRow("row-1", parentEntryId, "parent", "1"),
      relatedEntryRow("row-2", childEntryId, "child", "1"),
      relatedEntryRow("row-3", childEntryId2, "child", "2"),
    ]);
    expect(result.notifications).toEqual([
      trimmedEntryIdNotification("row-1", parentEntryId),
      trimmedEntryIdNotification("row-3", childEntryId2),
    ]);
  });

  it("requires a valid uuid entry id on every row", () => {
    const result = validateRows([
      relatedEntryRow("row-1", "not-a-uuid", "child", "1"),
      relatedEntryRow("row-2", childEntryId, "parent", "1"),
    ]);

    expect(result.errors).toEqual([
      { message: "Entry ID must be a valid UUID.", sources: ["row-1", "id"] },
    ]);
  });

  it("requires child order number to be an integer greater than 0", () => {
    const result = validateRows([
      relatedEntryRow("row-1", parentEntryId, "parent", "0"),
      relatedEntryRow("row-2", childEntryId, "child", "1.5"),
    ]);

    expect(result.errors).toEqual([
      {
        message: "Child order number must be an integer greater than 0.",
        sources: ["row-1", "orderNumber"],
      },
      {
        message: "Child order number must be an integer greater than 0.",
        sources: ["row-2", "orderNumber"],
      },
    ]);
  });

  it("reports duplicate entry ids across rows", () => {
    const result = validateRows([
      relatedEntryRow("row-1", parentEntryId, "parent", "1"),
      relatedEntryRow("row-2", childEntryId, "child", "1"),
      relatedEntryRow("row-3", childEntryId, "child", "2"),
    ]);

    expect(result.errors).toEqual([
      {
        message: `Duplicate uuid "${childEntryId}"`,
        sources: ["row-2", "row-3", "id"],
      },
    ]);
  });

  it("requires child order numbers to be sequential starting from 1", () => {
    const result = validateRows([
      relatedEntryRow("row-1", parentEntryId, "parent", "1"),
      relatedEntryRow("row-2", childEntryId, "child", "2"),
      relatedEntryRow("row-3", childEntryId2, "child", "3"),
    ]);

    expect(result.errors).toEqual([
      {
        message: "Child order numbers must be sequential starting from 1.",
        sources: ["row-1", "row-2", "row-3", "orderNumber"],
      },
    ]);
  });
});
