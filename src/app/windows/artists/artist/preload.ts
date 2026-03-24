import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  GET_ARTIST_BY_ID,
  OPEN_ENTRY_WINDOW,
  SEARCH_ARTIST_ENTRIES,
} from "@/constants/ipcEvents";
import type {
  CreateEntryWindowParams,
  SearchArtistEntriesParams,
} from "@/types/entries";

const api = {
  getArtistById: (artistId: string) =>
    ipcRenderer.invoke(GET_ARTIST_BY_ID, artistId),
  searchArtistEntries: (params: SearchArtistEntriesParams) =>
    ipcRenderer.invoke(SEARCH_ARTIST_ENTRIES, params),
  openNewEntryWindow: (params: CreateEntryWindowParams) =>
    ipcRenderer.send(OPEN_ENTRY_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
