import type { RelatedItemRelation } from "../common";

type FormFeedbackMessage = {
  message: string;
  sources?: PropertyKey[] | undefined;
};

export type FormFeedbackMessages = FormFeedbackMessage[];

type FeedbackNotification = {
  notification: string;
  sources?: PropertyKey[] | undefined;
};

export type FeedbackNotifications = FeedbackNotification[];

export type FormFieldValidationResult<
  T = string,
  E = FormFeedbackMessages,
  EResult = T,
> =
  | {
      valid: true;
      value: T;
      notifications?: FeedbackNotifications | undefined;
    }
  | {
      valid: false;
      value: EResult;
      errorMessages: E;
      notifications?: FeedbackNotifications | undefined;
    };

export type FormFeedback = {
  notifications: FeedbackNotifications;
  errors: FormFeedbackMessages;
};
export type RelatedItemRow<Relation extends string = RelatedItemRelation> = {
  id: string;
  relation: Relation;
};

export type RelatedOrderedItemRow = RelatedItemRow & {
  orderNumber: string;
};
