import { validate as isValidUuid } from "uuid";

import type {
  FormFieldError,
  FormFieldValidationResult,
  RelatedOrderedItemRow,
} from "@/types/form";
import { isChildReleasesOrderNumbersSequential } from "@/utils/relatedItems";
import { strictStringToIntSchema } from "@/validation";

const DEFAULT_INVALID_ORDER_NUMBER_MESSAGE =
  "Child order number must be an integer greater than 0.";

export type ValidateRelatedItemsMessages = {
  invalidRelatedId: string;
  invalidOrderNumber?: string;
  trimmedRelatedId: (relatedId: string) => string;
};

type ValidateRelatedItemsConfig<TRow extends RelatedOrderedItemRow> = {
  getRelatedId: (row: TRow) => string;
  withRelatedId: (row: TRow, relatedId: string) => TRow;
  messages: ValidateRelatedItemsMessages;
};

export const validateRelatedItems = <TRow extends RelatedOrderedItemRow>(
  rows: TRow[],
  { getRelatedId, withRelatedId, messages }: ValidateRelatedItemsConfig<TRow>,
): FormFieldValidationResult<TRow[], FormFieldError[]> => {
  const errorMessages: FormFieldError[] = [];
  const validatedRows: TRow[] = [];
  const notifications = [];

  const usedUuids = new Map<string, string[]>();

  for (const row of rows) {
    const rowId = row.id;
    const relatedId = getRelatedId(row);
    const trimmedRelatedId = relatedId.trim();

    if (!isValidUuid(trimmedRelatedId)) {
      errorMessages.push({
        message: messages.invalidRelatedId,
        sources: [rowId],
      });
    }

    usedUuids.set(trimmedRelatedId, [
      ...(usedUuids.get(trimmedRelatedId) ?? []),
      rowId,
    ]);

    const parsedOrderNumber = strictStringToIntSchema.safeParse(
      row.orderNumber.trim(),
    );

    if (!parsedOrderNumber.success || parsedOrderNumber.data <= 0) {
      errorMessages.push({
        message:
          messages.invalidOrderNumber ?? DEFAULT_INVALID_ORDER_NUMBER_MESSAGE,
        sources: [rowId],
      });
    }

    validatedRows.push(withRelatedId(row, trimmedRelatedId));

    if (trimmedRelatedId !== relatedId) {
      notifications.push({
        notification: messages.trimmedRelatedId(trimmedRelatedId),
      });
    }
  }

  for (const [relatedId, rowIds] of usedUuids.entries()) {
    if (rowIds.length > 1) {
      errorMessages.push({
        message: `Duplicate uuid "${relatedId}" used by multiple rows.`,
        sources: rowIds,
      });
    }
  }

  const isSequential = isChildReleasesOrderNumbersSequential(validatedRows);

  if (!isSequential) {
    errorMessages.push({
      message: "Child order numbers must be sequential starting from 1.",
    });
  }

  const valid = errorMessages.length === 0;

  if (!valid) {
    return {
      valid: false,
      value: validatedRows,
      errorMessages,
      notifications: notifications.length > 0 ? notifications : undefined,
    };
  }

  return {
    valid: true,
    value: validatedRows,
    notifications: notifications.length > 0 ? notifications : undefined,
  };
};
