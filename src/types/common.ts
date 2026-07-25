import type { PARENT_RELATION, CHILD_RELATION } from "@/constants";

export type RelatedItemRelation =
  | typeof PARENT_RELATION
  | typeof CHILD_RELATION;
