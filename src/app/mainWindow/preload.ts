import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  OPEN_ARTIST_ENTRIES_LIST_WINDOW,
  OPEN_ARTIST_QUERY_WINDOW,
  OPEN_ARTISTS_LIST_WINDOW,
} from "@/constants/ipcEvents";

const api = {
  openNewArtistsListWindow: () => ipcRenderer.send(OPEN_ARTISTS_LIST_WINDOW),
  openNewArtistQueryWindow: () => ipcRenderer.send(OPEN_ARTIST_QUERY_WINDOW),
  openNewArtistEntriesListWindow: () => ipcRenderer.send(OPEN_ARTIST_ENTRIES_LIST_WINDOW),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
