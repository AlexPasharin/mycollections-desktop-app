import { ARTIST_WINDOW } from "@/appConstants/appWindows";
import type { CreateArtistWindowParams } from "@/types/entries";
import createWindow from "@/utils/windows";

const createArtistWindow = (params: CreateArtistWindowParams) =>
  createWindow(ARTIST_WINDOW)(params);

export default createArtistWindow;
