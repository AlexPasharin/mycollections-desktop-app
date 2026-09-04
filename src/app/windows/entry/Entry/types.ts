import type { DbSource } from "@/db/db-source";
import type { ReleaseByIdResult } from "@/types/releases";

export type ReleaseFormTabCreateModeSharedData = {
  mode: "create";
  releaseId?: never;
  releaseBlueprint?: ReleaseByIdResult;
  dbSources?: ReadonlySet<DbSource> | undefined;
};

export type ReleaseFormTabUpdateModeSharedData = {
  mode: "update";
  releaseId: string;
  releaseBlueprint: ReleaseByIdResult;
  dbSources?: ReadonlySet<DbSource> | undefined;
};

export type ReleaseFormTabSharedData =
  | ReleaseFormTabCreateModeSharedData
  | ReleaseFormTabUpdateModeSharedData;

export type ReleaseFormTabMode = ReleaseFormTabSharedData["mode"];
