export type GeneralizedDate = {
  year: number;
  month?: number | undefined;
  day?: number | undefined;
};

/** Parse/validation outcome for a DB text generalized date (entry/release loaders). */
export type GeneralizedDateFromDbInvalid = {
  value: string;
  error: string;
};

export type GeneralizedDateFromDb =
  | null
  | GeneralizedDate
  | GeneralizedDateFromDbInvalid;
