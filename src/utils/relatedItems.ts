import { CHILD_RELATION } from "@/constants";
import type { RelatedOrderedItemRow } from "@/types/form";

export const getNextOrderNumber = (
  items: RelatedOrderedItemRow[],
): number | null => {
  const childOrderNumbers = getChildReleasesOrderNumbers(items);

  return childOrderNumbers === null ? 1 : Math.max(...childOrderNumbers) + 1;
};

export const isChildReleasesOrderNumbersSequential = (
  items: RelatedOrderedItemRow[],
): boolean => {
  const childOrderNumbers = getChildReleasesOrderNumbers(items);

  if (childOrderNumbers === null) {
    return true;
  }

  if (childOrderNumbers.every((n) => n !== 1)) {
    return false;
  }

  const maxOrderNumber = Math.max(...childOrderNumbers);

  return (
    maxOrderNumber === childOrderNumbers.length &&
    new Set(childOrderNumbers).size === childOrderNumbers.length
  );
};

const getChildReleasesOrderNumbers = (
  items: RelatedOrderedItemRow[],
): number[] | null => {
  const childRows = items.filter((r) => r.relation === CHILD_RELATION);

  if (!childRows.length) {
    return null;
  }

  return childRows.every((r) => r.orderNumber.match(/^[1-9]\d*$/))
    ? childRows.map((r) => parseInt(r.orderNumber, 10))
    : null;
};
