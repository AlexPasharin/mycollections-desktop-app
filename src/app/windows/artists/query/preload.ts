import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  OPEN_ARTIST_ENTRIES_LIST_WINDOW,
  QUERY_ARTIST,
} from "@/constants/ipcEvents";
import type { CreateArtistEntriesWindowParams } from "@/types/entries";

const api = {
  queryArtists: (query: string) => ipcRenderer.invoke(QUERY_ARTIST, query),
  openNewArtistEntriesListWindow: (params: CreateArtistEntriesWindowParams) =>
    ipcRenderer.send(OPEN_ARTIST_ENTRIES_LIST_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
