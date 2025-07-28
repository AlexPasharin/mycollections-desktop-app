import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import { FETCH_ARTISTS } from "@/constants/ipcEvents";
import type { FetchArtistsParams } from "@/types/artists";

const api = {
  fetchArtists: (params: FetchArtistsParams) =>
    ipcRenderer.invoke(FETCH_ARTISTS, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
