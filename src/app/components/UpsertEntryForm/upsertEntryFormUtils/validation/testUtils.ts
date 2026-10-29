import {
  initialUpsertEntryFormDraft,
  type UpsertEntryFormState,
} from "../formValues";

export const formStateWith = (
  overrides: Partial<Record<string, unknown>>,
): UpsertEntryFormState => {
  const initial = initialUpsertEntryFormDraft({});

  const state = Object.fromEntries(
    Object.entries(initial).map(([key, field]) => [
      key,
      {
        ...field,
        value: overrides[key] ?? field.value,
        validatedValue: null,
        errors: [],
        notifications: [],
      },
    ]),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return state as unknown as UpsertEntryFormState;
};
