import type { DbSource } from "@/db/db-source";
import type { ReleaseByIdResult } from "@/types/releases";

export type UpsertReleaseFormTabCreateModeSharedData = {
  mode: "create";
  releaseId?: never;
  releaseBlueprint?: ReleaseByIdResult;
  dbSources?: ReadonlySet<DbSource> | undefined;
};

export type UpsertReleaseFormTabUpdateModeSharedData = {
  mode: "update";
  releaseId: string;
  releaseBlueprint: ReleaseByIdResult;
  dbSources?: ReadonlySet<DbSource> | undefined;
};

export type UpsertReleaseFormTabSharedData =
  | UpsertReleaseFormTabCreateModeSharedData
  | UpsertReleaseFormTabUpdateModeSharedData;

export type UpsertReleaseFormTabMode = UpsertReleaseFormTabSharedData["mode"];
