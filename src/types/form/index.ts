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
