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

describe("validateRelatedReleases", () => {
  it("accepts rows with parent or child relation and does not validate release ids", () => {
    const result = validateRelatedReleases([
      relatedReleaseRow("row-1", "", "parent"),
      relatedReleaseRow("row-2", "not-a-uuid", "child"),
    ]);

    expect(result).toEqual({
      valid: true,
      value: [
        relatedReleaseRow("row-1", "", "parent"),
        relatedReleaseRow("row-2", "not-a-uuid", "child"),
      ],
    });
  });

  it("requires a parent or child relation on every row", () => {
    const rows = [
      relatedReleaseRow("row-1", "release-1", ""),
      relatedReleaseRow("row-2", "release-2", "parent"),
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
});
