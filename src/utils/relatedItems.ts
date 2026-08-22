import { CHILD_RELATION } from "@/constants";
import type { RelatedOrderedItemRow } from "@/types/form";

export const getNextOrderNumber = (
  items: RelatedOrderedItemRow[],
): number | null => {
  const childRows = items.filter((r) => r.relation === CHILD_RELATION);

  if (!childRows.length) {
    return 1;
  }

  return childRows.every((r) => r.orderNumber.match(/^[1-9]\d*$/))
    ? Math.max(...childRows.map((r) => parseInt(r.orderNumber, 10))) + 1
    : null;
};
