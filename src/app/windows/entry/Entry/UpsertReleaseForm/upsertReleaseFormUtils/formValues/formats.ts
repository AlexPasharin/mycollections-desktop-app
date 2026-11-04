import type { UpsertReleaseFormTabMode } from "../../../types";

import type { ReleasesFormatListItem } from "@/types/formats";
import type { ReleaseFormatOfReleaseItem } from "@/types/releases";
import { withNewId } from "@/utils/id";

export type UpsertReleaseFormFormatInput = {
  id: string;
  formatId: string;
  amount: string;
  pictureSleeve: boolean;
  jukeboxHole: boolean;
};

export type UpsertReleaseFormFormatInputs = UpsertReleaseFormFormatInput[];

export const defaultFormatInputRow = (): UpsertReleaseFormFormatInput =>
  withNewId({
    formatId: "",
    amount: "1",
    pictureSleeve: true,
    jukeboxHole: false,
  });

export const formatsToFormValue = (
  releaseFormats: ReleaseFormatOfReleaseItem[] | undefined,
  allFormats: ReleasesFormatListItem[],
  mode: UpsertReleaseFormTabMode,
): UpsertReleaseFormFormatInputs => {
  if (!releaseFormats?.length) {
    return mode === "update" ? [] : [defaultFormatInputRow()];
  }

  const formatIds = new Set(allFormats.map((format) => format.formatId));

  const rows = releaseFormats
    .map((format) => {
      const { formatId, amount, pictureSleeve, jukeboxHole } = format;

      if (!formatIds.has(formatId)) {
        return undefined;
      }

      return withNewId({
        formatId,
        amount: String(amount),
        pictureSleeve,
        jukeboxHole,
      });
    })
    .filter((row) => row !== undefined);

  return rows.length > 0 ? rows : [defaultFormatInputRow()];
};
