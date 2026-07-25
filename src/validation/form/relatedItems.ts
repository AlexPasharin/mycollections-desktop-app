import { validate as isValidUuid } from "uuid";

import type { RelatedItemRelation } from "@/types/common";
import type {
  FormFieldError,
  FormFieldValidationResult,
  RelatedItemRow,
} from "@/types/form";
import { strictStringToIntSchema } from "@/validation";

const DEFAULT_INVALID_ORDER_NUMBER_MESSAGE =
  "Child order number must be an integer greater than 0.";

type ValidateRelatedItemsMessages = {
  missingRelation: string;
  invalidRelatedId: string;
  invalidOrderNumber?: string;
  trimmedRelatedId: (relatedId: string) => string;
};

type ValidateRelatedItemsConfig<TRow extends RelatedItemRow> = {
  getRelatedId: (row: TRow) => string;
  withRelatedId: (row: TRow, relatedId: string) => TRow;
  messages: ValidateRelatedItemsMessages;
};

type TValidRow<TRow extends RelatedItemRow> = TRow & {
  relation: RelatedItemRelation;
};

export const validateRelatedItems = <TRow extends RelatedItemRow>(
  rows: TRow[],
  { getRelatedId, withRelatedId, messages }: ValidateRelatedItemsConfig<TRow>,
): FormFieldValidationResult<
  TValidRow<TRow>[],
  Record<string, FormFieldError[]>,
  TRow[]
> => {
  const errors: Record<string, FormFieldError[]> = {};
  const validatedRows: TRow[] = [];
  const notifications = [];
  let valid = true;

  const missingRelationError = { message: messages.missingRelation };
  const invalidRelatedIdError = { message: messages.invalidRelatedId };
  const invalidOrderNumberError = {
    message:
      messages.invalidOrderNumber ?? DEFAULT_INVALID_ORDER_NUMBER_MESSAGE,
  };

  for (const row of rows) {
    const rowErrors = [];
    const trimmedRelatedId = getRelatedId(row).trim();

    if (row.relation === "") {
      rowErrors.push(missingRelationError);
    }

    if (!isValidUuid(trimmedRelatedId)) {
      rowErrors.push(invalidRelatedIdError);
    }

    const parsedOrderNumber = strictStringToIntSchema.safeParse(
      row.orderNumber.trim(),
    );

    if (!parsedOrderNumber.success || parsedOrderNumber.data <= 0) {
      rowErrors.push(invalidOrderNumberError);
    }

    if (rowErrors.length > 0) {
      valid = false;
      errors[row.id] = rowErrors;
    }

    validatedRows.push(withRelatedId(row, trimmedRelatedId));

    if (trimmedRelatedId !== getRelatedId(row)) {
      notifications.push({
        notification: messages.trimmedRelatedId(trimmedRelatedId),
      });
    }
  }

  if (!valid) {
    return {
      valid: false,
      value: validatedRows,
      errorMessages: errors,
      notifications: notifications.length > 0 ? notifications : undefined,
    };
  }

  return {
    valid: true,

    // Relation is verified above for every row when valid is true.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    value: validatedRows as unknown as TValidRow<TRow>[],
    notifications: notifications.length > 0 ? notifications : undefined,
  };
};
