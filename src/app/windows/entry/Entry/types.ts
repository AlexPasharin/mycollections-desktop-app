import type { DbSource } from "@/db/db-source";
import type { ReleaseByIdResult } from "@/types/releases";

export type ReleaseFormTabCreateModeSharedData = {
  mode: "create";
  releaseBlueprint?: ReleaseByIdResult;
  dbSources?: ReadonlySet<DbSource> | undefined;
};

export type ReleaseFormTabUpdateModeSharedData = {
  mode: "update";
  releaseBlueprint: ReleaseByIdResult;
  dbSources?: ReadonlySet<DbSource> | undefined;
};

export type ReleaseFormTabSharedData =
  | ReleaseFormTabCreateModeSharedData
  | ReleaseFormTabUpdateModeSharedData;

export type ReleaseFormTabMode = ReleaseFormTabSharedData["mode"];
