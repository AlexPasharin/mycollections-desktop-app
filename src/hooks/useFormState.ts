import { useState } from "react";

import type {
  FormFeedbackMessages,
  FormStateType,
  InitialFormStateValue,
} from "@/types/form";

const useFormState = <T extends Record<PropertyKey, unknown>, U extends T = T>({
  initialValue,
}: {
  initialValue: InitialFormStateValue<T, U>;
}) => {
  const [formState, setFormState] = useState(getInitialValue(initialValue));
  const [validatedForm, setValidatedForm] = useState<U | null>(null);

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

  const validateForm = (): boolean => {
    const validationResults: Record<PropertyKey, unknown> = {};
    let valid = true;

    for (const key of Object.keys(formState)) {
      const validatedValue = validateField(key as keyof T);
      const fieldIsValid = validatedValue !== undefined;

      if (fieldIsValid) {
        validationResults[key] = validatedValue;
      } else {
        valid = false;
      }
    }

    // assertion safe by construction
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    setValidatedForm(valid ? (validationResults as U) : null);

    return valid;
  };

  const clearFieldFeedback = <K extends keyof T>(
    key: K,
    ...sources: PropertyKey[]
  ) =>
    setField(key, (prev) => {
      const { errors, notifications } = prev[key];

      return {
        ...prev[key],
        errors: removeFeedbackMessages(errors, sources),
        notifications: removeFeedbackMessages(notifications, sources),
      };
    });

  const resetFormState = (
    nextInitialValue: InitialFormStateValue<T, U> = initialValue,
  ) => {
    setFormState(getInitialValue(nextInitialValue));
  };

  const toInitialFormStateValue = () => {
    const persistedValue: Partial<InitialFormStateValue<T, U>> = {};

    for (const key of Object.keys(formState) as (keyof T)[]) {
      persistedValue[key] = {
        value: formState[key].value,
        validationFn: formState[key].validationFn,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return persistedValue as InitialFormStateValue<T, U>; // should be safe by construction above
  };

  return {
    formState,
    validatedForm,
    setField,
    setFieldValue,
    validateField,
    clearFieldFeedback,
    resetFormState,
    validateForm,
    toInitialFormStateValue,
  };
};

export default useFormState;

const removeFeedbackMessages = (
  messages: FormFeedbackMessages,
  sources: PropertyKey[],
) =>
  messages.filter(
    ({ sources: msgSources }) =>
      !sources.every((source) => msgSources?.includes(source)),
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
