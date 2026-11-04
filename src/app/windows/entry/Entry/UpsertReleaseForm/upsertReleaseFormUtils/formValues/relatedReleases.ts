import { PARENT_RELATION, CHILD_RELATION } from "@/constants";
import type { RelatedItemRelation } from "@/types/common";
import type { RelatedOrderedItemRow } from "@/types/form";
import type { ReleaseByIdResult } from "@/types/releases";
import { withNewId } from "@/utils/id";

export type UpsertReleaseFormRelatedReleaseRow = RelatedOrderedItemRow & {
  releaseId: string;
};

export type ValidUpsertReleaseFormRelatedReleaseRow =
  UpsertReleaseFormRelatedReleaseRow & {
    relation: RelatedItemRelation;
  };

export const defaultRelatedReleaseRow = (
  childReleaseOrderNumber: number | null,
): UpsertReleaseFormRelatedReleaseRow =>
  withNewId({
    releaseId: "",
    relation: "child",
    orderNumber:
      childReleaseOrderNumber === null ? "" : String(childReleaseOrderNumber),
  });

export const relatedReleasesToFormValue = (
  parentReleases: ReleaseByIdResult["parentReleases"] | undefined,
  childReleases: ReleaseByIdResult["childReleases"] | undefined,
): ValidUpsertReleaseFormRelatedReleaseRow[] => [
  ...(parentReleases ?? []).map((release) =>
    withNewId({
      releaseId: release.releaseId,
      relation: PARENT_RELATION as RelatedItemRelation,
      orderNumber: String(release.childReleaseOrderNumber),
    }),
  ),
  ...(childReleases ?? []).map((release) =>
    withNewId({
      releaseId: release.releaseId,
      relation: CHILD_RELATION as RelatedItemRelation,
      orderNumber: String(release.childReleaseOrderNumber),
    }),
  ),
];
