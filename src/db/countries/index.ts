import client from "../client/kysely";

import type { CountryListItem } from "@/types/countries";

export const fetchCountries = (): Promise<CountryListItem[]> =>
  client
    .selectFrom("countries")
    .select(["codeName", "name"])
    .orderBy("name")
    .execute();
