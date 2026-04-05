/** Year / year–month (no `day`), or year–month with optional day (full date). */
export type GeneralizedDate =
  | { year: number; month?: number | undefined; day?: never }
  | { year: number; month: number; day?: number | undefined };
