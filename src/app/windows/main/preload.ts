import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  OPEN_ARTIST_WINDOW,
  OPEN_ARTIST_QUERY_WINDOW,
  OPEN_ARTISTS_LIST_WINDOW,
  OPEN_ENTRY_WINDOW,
} from "@/constants/ipcEvents";
import type { CreateEntryWindowParams } from "@/types/entries";

const api = {
  openNewArtistsListWindow: () => ipcRenderer.send(OPEN_ARTISTS_LIST_WINDOW),
  openNewArtistQueryWindow: () => ipcRenderer.send(OPEN_ARTIST_QUERY_WINDOW),
  openNewArtistWindow: () => ipcRenderer.send(OPEN_ARTIST_WINDOW),
  openNewEntryWindow: (params: CreateEntryWindowParams) =>
    ipcRenderer.send(OPEN_ENTRY_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
