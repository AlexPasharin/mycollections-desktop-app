import { dbClient } from "../client/kysely";

import type { DbSource } from "@/db/db-source";
import type { CountryListItem } from "@/types/countries";

export const fetchCountries = (
  dbSource?: DbSource,
): Promise<CountryListItem[]> =>
  dbClient(dbSource)
    .selectFrom("countries")
    .select(["codeName", "name"])
    .orderBy("name")
    .execute();
