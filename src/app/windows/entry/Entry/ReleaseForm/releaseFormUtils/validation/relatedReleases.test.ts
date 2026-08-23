import { validateRelatedReleases } from "./relatedReleases";

import type { ReleaseFormRelatedReleaseRow } from "../formValues";

import type { RelatedItemRelation } from "@/types/common";

const relatedReleaseRow = (
  id: string,
  releaseId: string,
  relation: RelatedItemRelation,
  orderNumber: string,
): ReleaseFormRelatedReleaseRow => ({
  id,
  releaseId,
  relation,
  orderNumber,
});

const parentReleaseId = "11111111-1111-4111-8111-111111111111";
const childReleaseId = "22222222-2222-4222-8222-222222222222";
const childReleaseId2 = "33333333-3333-4333-8333-333333333333";

const trimmedReleaseIdNotification = (releaseId: string) => ({
  notification: `Note: release ID "${releaseId}" has been trimmed`,
});

describe("validateRelatedReleases", () => {
  it("accepts rows with parent or child relation and a valid release id", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", parentReleaseId, "parent", "1"),
      relatedReleaseRow("row-2", childReleaseId, "child", "1"),
    ]);

    expect(result).toEqual({
      valid: true,
      value: [
        relatedReleaseRow("row-1", parentReleaseId, "parent", "1"),
        relatedReleaseRow("row-2", childReleaseId, "child", "1"),
      ],
    });
  });

  it("trims release ids in the validated value", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", `  ${parentReleaseId}  `, "parent", "1"),
    ]);

    expect(result).toEqual({
      valid: true,
      value: [relatedReleaseRow("row-1", parentReleaseId, "parent", "1")],
      notifications: [trimmedReleaseIdNotification(parentReleaseId)],
    });
  });

  it("emits one trim notification per trimmed release id", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", `  ${parentReleaseId}  `, "parent", "1"),
      relatedReleaseRow("row-2", childReleaseId, "child", "1"),
      relatedReleaseRow("row-3", ` ${childReleaseId2} `, "child", "2"),
    ]);

    expect(result).toEqual({
      valid: true,
      value: [
        relatedReleaseRow("row-1", parentReleaseId, "parent", "1"),
        relatedReleaseRow("row-2", childReleaseId, "child", "1"),
        relatedReleaseRow("row-3", childReleaseId2, "child", "2"),
      ],
      notifications: [
        trimmedReleaseIdNotification(parentReleaseId),
        trimmedReleaseIdNotification(childReleaseId2),
      ],
    });
  });

  it("requires a valid uuid release id on every row", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", "", "parent", "1"),
      relatedReleaseRow("row-2", "not-a-uuid", "child", "1"),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual([
      { message: "Release ID must be a valid UUID.", sources: ["row-1"] },
      { message: "Release ID must be a valid UUID.", sources: ["row-2"] },
    ]);
  });

  it("requires child order number to be an integer greater than 0", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", parentReleaseId, "parent", "0"),
      relatedReleaseRow("row-2", childReleaseId, "child", "2.2"),
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

  it("reports duplicate release ids across rows", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", parentReleaseId, "parent", "1"),
      relatedReleaseRow("row-2", childReleaseId, "child", "1"),
      relatedReleaseRow("row-3", childReleaseId, "child", "2"),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual([
      {
        message: `Duplicate uuid "${childReleaseId}" used by multiple rows.`,
        sources: ["row-2", "row-3"],
      },
    ]);
  });

  it("requires child order numbers to be sequential starting from 1", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", parentReleaseId, "parent", "1"),
      relatedReleaseRow("row-2", childReleaseId, "child", "2"),
      relatedReleaseRow("row-3", childReleaseId2, "child", "3"),
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
