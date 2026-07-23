import { validateRelatedReleases } from "./relatedReleases";

import type { ReleaseFormRelatedReleaseRow } from "../formValues";

const relatedReleaseRow = (
  id: string,
  releaseId: string,
  relation: ReleaseFormRelatedReleaseRow["relation"],
): ReleaseFormRelatedReleaseRow => ({
  id,
  releaseId,
  relation,
});

const parentReleaseId = "11111111-1111-4111-8111-111111111111";
const childReleaseId = "22222222-2222-4222-8222-222222222222";

const trimmedReleaseIdNotification = (releaseId: string) => ({
  notification: `Note: release ID has been trimmed to "${releaseId}"`,
});

describe("validateRelatedReleases", () => {
  it("accepts rows with parent or child relation and a valid release id", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", parentReleaseId, "parent"),
      relatedReleaseRow("row-2", childReleaseId, "child"),
    ]);

    expect(result).toEqual({
      valid: true,
      value: [
        relatedReleaseRow("row-1", parentReleaseId, "parent"),
        relatedReleaseRow("row-2", childReleaseId, "child"),
      ],
    });
  });

  it("trims release ids in the validated value", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", `  ${parentReleaseId}  `, "parent"),
    ]);

    expect(result).toEqual({
      valid: true,
      value: [relatedReleaseRow("row-1", parentReleaseId, "parent")],
      notifications: [trimmedReleaseIdNotification(parentReleaseId)],
    });
  });

  it("emits one trim notification per trimmed release id", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", `  ${parentReleaseId}  `, "parent"),
      relatedReleaseRow("row-2", childReleaseId, "child"),
      relatedReleaseRow("row-3", ` ${childReleaseId} `, "child"),
    ]);

    expect(result).toEqual({
      valid: true,
      value: [
        relatedReleaseRow("row-1", parentReleaseId, "parent"),
        relatedReleaseRow("row-2", childReleaseId, "child"),
        relatedReleaseRow("row-3", childReleaseId, "child"),
      ],
      notifications: [
        trimmedReleaseIdNotification(parentReleaseId),
        trimmedReleaseIdNotification(childReleaseId),
      ],
    });
  });

  it("requires a parent or child relation on every row", () => {
    const rows = [
      relatedReleaseRow("row-1", parentReleaseId, ""),
      relatedReleaseRow("row-2", childReleaseId, "parent"),
    ];

    const result = validateRelatedReleases(rows);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual({
      "row-1": [
        { message: "Choose whether this release is a parent or a child." },
      ],
    });
  });

  it("requires a valid uuid release id on every row", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", "", "parent"),
      relatedReleaseRow("row-2", "not-a-uuid", "child"),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual({
      "row-1": [{ message: "Release ID must be a valid UUID." }],
      "row-2": [{ message: "Release ID must be a valid UUID." }],
    });
  });

  it("reports both relation and release id errors on the same row", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", "not-a-uuid", ""),
    ]);

    expect(result.valid).toBe(false);

    if (result.valid) {
      return;
    }

    expect(result.errorMessages).toEqual({
      "row-1": [
        { message: "Choose whether this release is a parent or a child." },
        { message: "Release ID must be a valid UUID." },
      ],
    });
  });
});
