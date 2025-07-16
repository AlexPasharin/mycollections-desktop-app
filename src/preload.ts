import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";
import type { FetchArtistsParams } from "./types/artists";

const api: API = {
  fetchArtists: ({ cursor }: FetchArtistsParams) =>
    ipcRenderer.invoke("fetch-artists", { cursor }),
};

contextBridge.exposeInMainWorld("api", api);
