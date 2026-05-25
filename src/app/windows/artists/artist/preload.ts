import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  GET_ARTIST_BY_ID,
  OPEN_ENTRY_WINDOW,
  SEARCH_ARTIST_ENTRIES,
} from "@/appConstants/ipcEvents";
import type { DbSource } from "@/db/db-source";
import type {
  CreateEntryWindowParams,
  SearchArtistEntriesParams,
} from "@/types/entries";

const api = {
  getArtistById: (artistId: string, dbSource: DbSource) =>
    ipcRenderer.invoke(GET_ARTIST_BY_ID, artistId, dbSource),
  searchArtistEntries: (
    params: SearchArtistEntriesParams,
    dbSource: DbSource,
  ) => ipcRenderer.invoke(SEARCH_ARTIST_ENTRIES, params, dbSource),
  openNewEntryWindow: (params: CreateEntryWindowParams) =>
    ipcRenderer.send(OPEN_ENTRY_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
