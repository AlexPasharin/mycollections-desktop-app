import { contextBridge, ipcRenderer } from "electron";

import type { API } from "@/api";
import type { FetchArtistsParams } from "@/types/artists";

const api: API = {
  fetchArtists: (params: FetchArtistsParams) =>
    ipcRenderer.invoke("fetch-artists", params),
} as const;

contextBridge.exposeInMainWorld("api", api);
