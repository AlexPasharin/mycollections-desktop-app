type FeedbackError = {
  message: string;
};

export type FormFieldError = FeedbackError & {
  sources?: PropertyKey[] | undefined;
};

export type FeedbackNotifications = {
  notification: string;
}[];

export type FormFieldValidationResult<T = string, E = FormFieldError[]> =
  | {
      valid: true;
      value: T;
      notifications?: FeedbackNotifications | undefined;
    }
  | {
      valid: false;
      value: T;
      errorMessages: E;
      notifications?: FeedbackNotifications | undefined;
    };

export type FormField<T = string, U = FormFieldError[]> = {
  value: T;
  valid: boolean;
  validationFn: (value: T) => FormFieldValidationResult<T, U>;
  errors: U;
  notifications: FeedbackNotifications;
};

export type FeedbackErrors = FeedbackError[];

export type FormFeedback = {
  notifications: FeedbackNotifications;
  errors: FeedbackErrors;
};
