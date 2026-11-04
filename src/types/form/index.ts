import type { RelatedItemRelation } from "../common";

type FormFeedbackMessage = {
  message: string;
  sources?: PropertyKey[] | undefined;
};

export type FormFeedbackMessages = FormFeedbackMessage[];

export type FormValidationFnResult<T, U = T> = {
  notifications: FormFeedbackMessages;
} & (
  | {
      value?: never;
      validatedValue: U;
      errors?: never;
    }
  | {
      value: T;
      errors: FormFeedbackMessages;
      validatedValue?: never;
    }
);

export type FormValidationFn<
  T extends Record<PropertyKey, unknown>,
  U extends T = T,
  K extends keyof T = keyof T,
> = (state: FormStateType<T, U>) => FormValidationFnResult<T[K], U[K]>;

export type InitialFormStateValue<
  T extends Record<PropertyKey, unknown>,
  U extends T = T,
> = {
  [key in keyof T]: {
    value: T[key];
    validationFn: FormValidationFn<T, U, key>;
  };
};

export type FormStateType<
  T extends Record<PropertyKey, unknown>,
  U extends T = T,
> = {
  [key in keyof T]: InitialFormStateValue<T, U>[key] & {
    validatedValue: U[key] | null;
    errors: FormFeedbackMessages;
    notifications: FormFeedbackMessages;
  };
};

export type FormFeedback = {
  notifications: FormFeedbackMessages;
  errors: FormFeedbackMessages;
};
export type RelatedItemRow<Relation extends string = RelatedItemRelation> = {
  id: string;
  relation: Relation;
};

export type RelatedOrderedItemRow = RelatedItemRow & {
  orderNumber: string;
};
