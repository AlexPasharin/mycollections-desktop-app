import { LABELS_WINDOW } from "@/appConstants/appWindows";
import type { CreateLabelsWindowParams } from "@/types/labels";
import createWindow from "@/utils/windows";

const createLabelsWindow = (params: CreateLabelsWindowParams) =>
  createWindow(LABELS_WINDOW)(params);

export default createLabelsWindow;
