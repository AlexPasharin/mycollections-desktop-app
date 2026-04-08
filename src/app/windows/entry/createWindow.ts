import { ENTRY_WINDOW } from "@/appConstants/appWindows";
import type { CreateEntryWindowParams } from "@/types/entries";
import createWindow from "@/utils/windows";

const createEntryWindow = (params: CreateEntryWindowParams) =>
  createWindow(ENTRY_WINDOW)(params);

export default createEntryWindow;
