import type { DbSource } from "@/db/db-source";

export type LabelListItem = {
  labelId: string;
  name: string;
};

export type FetchLabels = (dbSource: DbSource) => Promise<LabelListItem[]>;

export type CreateLabelInput = {
  name: string;
  labelId?: string;
};

export type CreateLabelResult = {
  label: LabelListItem;
  notifications: string[];
};

export type CreateLabel = (
  input: CreateLabelInput,
  dbSource: DbSource,
) => Promise<CreateLabelResult>;

export type CreateLabelsWindowParams = {
  source: DbSource;
};
