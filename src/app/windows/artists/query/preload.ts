import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import { QUERY_ARTIST } from "@/constants/ipcEvents";

const api = {
  queryArtists: (query: string) => ipcRenderer.invoke(QUERY_ARTIST, query),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
