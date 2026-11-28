import { ENTRY_WINDOW } from "@/appConstants/appWindows";
import type { CreateEntryWindowParams } from "@/types/entries";
import createWindow from "@/utils/windows";

const createEntryWindow = ({
  entryId,
  source,
  releaseId,
  specialArtist,
}: CreateEntryWindowParams) =>
  createWindow(ENTRY_WINDOW)({
    entryId,
    source,
    ...(releaseId !== undefined && { releaseId }),
    ...(specialArtist !== undefined && { specialArtist }),
  });

export default createEntryWindow;
