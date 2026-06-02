export type FormFieldError = {
  message: string;
  sources?: PropertyKey[] | undefined;
};

type Notifications =
  | {
      notification: string;
    }[]
  | undefined;

export type FormFieldValidationResult<T = string, E = FormFieldError[]> =
  | {
      valid: true;
      value: T;
      notifications?: Notifications;
    }
  | {
      valid: false;
      value: T;
      errorMessages: E;
      notifications?: Notifications;
    };

export type FormField<T = string, U = FormFieldError[]> = {
  value: T;
  valid: boolean;
  validationFn: (value: T) => FormFieldValidationResult<T, U>;
  errors: U;
  notifications: {
    notification: string;
  }[];
};
