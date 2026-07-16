type FeedbackError = {
  message: string;
};

export type FormFieldError = FeedbackError & {
  sources?: PropertyKey[] | undefined;
};

export type FeedbackNotifications = {
  notification: string;
}[];

export type FormFieldValidationResult<
  T = string,
  E = FormFieldError[],
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

export type FormField<
  T = string,
  U = FormFieldError[],
  VResult = T,
  EResult = T,
> = {
  value: T;
  valid: boolean;
  validationFn: (
    value: T,
    form?: Record<string, FormField<unknown, unknown, unknown, unknown>>,
  ) => FormFieldValidationResult<VResult, U, EResult>;
  errors: U;
  notifications: FeedbackNotifications;
};

export type FeedbackErrors = FeedbackError[];

export type FormFeedback = {
  notifications: FeedbackNotifications;
  errors: FeedbackErrors;
};
