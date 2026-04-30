export type FormFieldValidationResult<T, E> =
  | {
      valid: true;
      value: T;
      notifications?:
        | [
            {
              notification: string;
            },
          ]
        | undefined;
    }
  | {
      valid: false;
      value: T;
      errorMessages: E;
    };
