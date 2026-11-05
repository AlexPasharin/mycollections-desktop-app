import type { ReleaseByIdResult } from "@/types/releases";

export type UpsertReleaseFormTabCreateModeSharedData = {
  mode: "create";
  releaseId?: never;
  releaseBlueprint?: ReleaseByIdResult | undefined;
};

export type UpsertReleaseFormTabUpdateModeSharedData = {
  mode: "update";
  releaseId: string;
  releaseBlueprint: ReleaseByIdResult | undefined;
};

export type UpsertReleaseFormTabSharedData =
  | UpsertReleaseFormTabCreateModeSharedData
  | UpsertReleaseFormTabUpdateModeSharedData;

export type UpsertReleaseFormTabMode = UpsertReleaseFormTabSharedData["mode"];
