import { ARTIST_ENTRIES_WINDOW } from "@/constants/appWindows";
import type { CreateArtistEntriesWindowParams } from "@/types/entries";
import createWindow from "@/utils/windows";

const createArtistEntriesWindow = (params: CreateArtistEntriesWindowParams) =>
  createWindow(ARTIST_ENTRIES_WINDOW)(params);

export default createArtistEntriesWindow;
