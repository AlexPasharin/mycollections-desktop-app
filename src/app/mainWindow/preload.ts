import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

const api = {
  openNewArtistsWindow: () => ipcRenderer.send("open-new-artists-window"),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
