import { useState } from "react";

export type FormFeedbackMessage = {
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

const useFormState = <T extends Record<PropertyKey, unknown>, U extends T = T>({
  initialValue,
}: {
  initialValue: InitialFormStateValue<T, U>;
}) => {
  const [formState, setFormState] = useState(getInitialValue(initialValue));

  const setField = <K extends keyof T>(
    key: K,
    valueFn: (prev: FormStateType<T, U>) => FormStateType<T, U>[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: valueFn(prev),
    }));
  };

  const setFieldValue = <K extends keyof T>(
    key: K,
    valueFn: (prev: FormStateType<T, U>) => T[K],
  ) =>
    setField(key, (prev) => ({
      ...prev[key],
      value: valueFn(prev),
    }));

  const validateField = <K extends keyof T>(key: K): U[K] | undefined => {
    const { value, validatedValue, errors, notifications } =
      formState[key].validationFn(formState);

    setField(key, (prev) => ({
      ...prev[key],
      value: validatedValue ?? value, // NOTE: by construction, either validatedValue or value has always a defined value
      validatedValue: validatedValue ?? null,
      errors: errors ?? [],
      notifications,
    }));

    return validatedValue;
  };

  const validateForm = (): U | null => {
    const validationResults: Record<PropertyKey, unknown> = {};
    let valid = true;

    for (const key of Object.keys(formState)) {
      const validatedValue = validateField(key);
      const fieldIsValid = validatedValue !== undefined;

      if (fieldIsValid) {
        validationResults[key] = validatedValue;
      } else {
        valid = false;
      }
    }

    if (valid) {
      // assertion safe by construction
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return validationResults as U;
    }

    return null;
  };

  const clearFieldFeedback = <K extends keyof T>(
    key: K,
    source?: PropertyKey,
  ) =>
    setField(key, (prev) => {
      const { errors, notifications } = prev[key];

      return {
        ...prev[key],
        errors: removeFeedbackMessages(errors, source),
        notifications: removeFeedbackMessages(notifications),
      };
    });

  const resetFormState = () => {
    setFormState(getInitialValue(initialValue));
  };

  return {
    formState,
    setField,
    setFieldValue,
    validateField,
    clearFieldFeedback,
    resetFormState,
    validateForm,
  };
};

export default useFormState;

const removeFeedbackMessages = (
  messages: FormFeedbackMessages,
  source?: PropertyKey,
) =>
  messages.filter(
    (msg) => msg.sources && (!source || !msg.sources.includes(source)),
  );

const getInitialValue = <T extends Record<string, unknown>, U extends T = T>(
  initialValue: InitialFormStateValue<T, U>,
) => {
  const partialState: Record<PropertyKey, unknown> = {};

  for (const key of Object.keys(initialValue)) {
    partialState[key] = {
      ...initialValue[key],
      validatedValue: null,
      errors: [],
      notifications: [],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return partialState as FormStateType<T, U>; // should be safe by construction above
};
