import type { DbSource } from "@/db/db-source";

export type CountryListItem = {
  codeName: string;
  name: string;
};

export type FetchCountries = (dbSource: DbSource) => Promise<CountryListItem[]>;
