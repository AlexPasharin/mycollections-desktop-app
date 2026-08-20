import type { JsonParsingErrorData, ReleaseByIdResult } from "@/types/releases";
import { formatJson } from "@/utils/common";

export type ReleaseFormMatrixRunoutDraft = {
  value: string;
  treatAsText: boolean;
};

export const matrixRunoutToFormValue = (
  matrixRunout: ReleaseByIdResult["matrixRunout"] | undefined,
): ReleaseFormMatrixRunoutDraft => {
  if (matrixRunout == null || isMatrixRunoutJsonParsingError(matrixRunout)) {
    return { value: "", treatAsText: false };
  }

  if (typeof matrixRunout === "string") {
    return { value: matrixRunout, treatAsText: true };
  }

  return {
    value: formatJson(matrixRunout) ?? "",
    treatAsText: false,
  };
};

const isMatrixRunoutJsonParsingError = (
  matrixRunout: ReleaseByIdResult["matrixRunout"],
): matrixRunout is JsonParsingErrorData =>
  matrixRunout !== null &&
  typeof matrixRunout === "object" &&
  !Array.isArray(matrixRunout) &&
  "rawJson" in matrixRunout &&
  "error" in matrixRunout &&
  typeof matrixRunout.error === "string";
