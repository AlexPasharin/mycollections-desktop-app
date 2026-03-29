import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  OPEN_ARTIST_WINDOW,
  OPEN_ARTISTS_LIST_WINDOW,
  OPEN_ENTRY_WINDOW,
  QUERY_ARTIST,
} from "@/constants/ipcEvents";
import type {
  CreateArtistWindowParams,
  CreateEntryWindowParams,
} from "@/types/entries";

const api = {
  openNewArtistsListWindow: () => ipcRenderer.send(OPEN_ARTISTS_LIST_WINDOW),
  queryArtists: (query: string) => ipcRenderer.invoke(QUERY_ARTIST, query),
  openNewArtistWindow: (params: CreateArtistWindowParams) =>
    ipcRenderer.send(OPEN_ARTIST_WINDOW, params),
  openNewEntryWindow: (params: CreateEntryWindowParams) =>
    ipcRenderer.send(OPEN_ENTRY_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
