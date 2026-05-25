import { dbClient } from "../client/kysely";

import type { FetchCountries } from "@/types/countries";

export const fetchCountries: FetchCountries = (dbSource) =>
  dbClient(dbSource)
    .selectFrom("countries")
    .select(["codeName", "name"])
    .orderBy("name")
    .execute();
