import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

const api = {
  queryArtists: (query: string) => ipcRenderer.invoke("query-artists", query),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
