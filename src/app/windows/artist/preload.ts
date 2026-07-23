import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  CREATE_MUSICAL_ENTRY,
  FETCH_ENTRY_TYPES,
  FETCH_TAGS,
  GET_ARTIST_BY_ID,
  UPDATE_ARTIST,
  OPEN_ENTRY_WINDOW,
  SEARCH_ARTIST_ENTRIES,
} from "@/appConstants/ipcEvents";
import type { DbSource } from "@/db/db-source";
import type { UpdateArtistInput } from "@/types/artists";
import type {
  CreateEntryWindowParams,
  CreateMusicalEntryInput,
  SearchArtistEntriesParams,
} from "@/types/entries";

const api = {
  getArtistById: (artistId: string, dbSource: DbSource) =>
    ipcRenderer.invoke(GET_ARTIST_BY_ID, artistId, dbSource),
  updateArtist: (input: UpdateArtistInput, dbSource: DbSource) =>
    ipcRenderer.invoke(UPDATE_ARTIST, input, dbSource),
  searchArtistEntries: (
    params: SearchArtistEntriesParams,
    dbSource: DbSource,
  ) => ipcRenderer.invoke(SEARCH_ARTIST_ENTRIES, params, dbSource),
  fetchTags: (dbSource: DbSource) => ipcRenderer.invoke(FETCH_TAGS, dbSource),
  fetchEntryTypes: (dbSource: DbSource) =>
    ipcRenderer.invoke(FETCH_ENTRY_TYPES, dbSource),
  createMusicalEntry: (input: CreateMusicalEntryInput, dbSource: DbSource) =>
    ipcRenderer.invoke(CREATE_MUSICAL_ENTRY, input, dbSource),
  openNewEntryWindow: (params: CreateEntryWindowParams) =>
    ipcRenderer.send(OPEN_ENTRY_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
