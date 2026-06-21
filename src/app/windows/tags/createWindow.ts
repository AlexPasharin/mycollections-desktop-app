import { TAGS_WINDOW } from "@/appConstants/appWindows";
import type { CreateTagsWindowParams } from "@/types/tags";
import createWindow from "@/utils/windows";

const createTagsWindow = (params: CreateTagsWindowParams) =>
  createWindow(TAGS_WINDOW)(params);

export default createTagsWindow;
