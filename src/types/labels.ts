import type { DbSource } from "@/db/db-source";

export type LabelListItem = {
  labelId: string;
  name: string;
};

export type FetchLabels = (dbSource: DbSource) => Promise<LabelListItem[]>;
