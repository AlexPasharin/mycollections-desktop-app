import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import { GET_ENTRY_BY_ID } from "@/constants/ipcEvents";

const api = {
  getEntryById: (entryId: string) =>
    ipcRenderer.invoke(GET_ENTRY_BY_ID, entryId),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
