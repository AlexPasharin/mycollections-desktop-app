import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import { OPEN_ARTIST_WINDOW, QUERY_ARTIST } from "@/constants/ipcEvents";
import type { CreateArtistWindowParams } from "@/types/entries";

const api = {
  queryArtists: (query: string) => ipcRenderer.invoke(QUERY_ARTIST, query),
  openNewArtistWindow: (params: CreateArtistWindowParams) =>
    ipcRenderer.send(OPEN_ARTIST_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
