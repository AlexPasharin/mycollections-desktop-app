type Notifications =
  | {
      notification: string;
    }[]
  | undefined;

export type FormFieldValidationResult<T, E> =
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

export type FormField<T, U> = {
  value: T;
  valid: boolean;
  validationFn: (value: T) => FormFieldValidationResult<T, U>;
  errors: U;
  notifications: {
    notification: string;
  }[];
};
