import {
  initialUpsertReleaseFormStateValue,
  type UpsertReleaseFormEntry,
  type UpsertReleaseFormState,
} from "../formValues";

const entry: UpsertReleaseFormEntry = {
  entryId: "entry-1",
  mainName: "Album",
  originalReleaseDate: { year: 1980, month: 1, day: 15 },
  comment: null,
  discogsUrl: null,
  partOfQueenCollection: false,
  relationToQueen: null,
  artists: [],
  types: [],
  altNames: [],
  tags: [],
  parentEntries: [],
  childEntries: [],
};

export const formStateWith = (
  overrides: Partial<Record<string, unknown>>,
): UpsertReleaseFormState => {
  const initial = initialUpsertReleaseFormStateValue({
    entry,
    allFormats: [],
    allCountries: [],
    mode: "create",
  });

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
  return state as unknown as UpsertReleaseFormState;
};
