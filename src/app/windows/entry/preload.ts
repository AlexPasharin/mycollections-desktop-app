import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  GET_ENTRY_BY_ID,
  GET_ENTRY_RELEASES,
  GET_RELEASE_BY_ID,
} from "@/appConstants/ipcEvents";

const api = {
  getEntryById: (entryId: string) =>
    ipcRenderer.invoke(GET_ENTRY_BY_ID, entryId),
  getEntryReleases: (entryId: string) =>
    ipcRenderer.invoke(GET_ENTRY_RELEASES, entryId),
  getReleaseById: (releaseId: string) =>
    ipcRenderer.invoke(GET_RELEASE_BY_ID, releaseId),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
