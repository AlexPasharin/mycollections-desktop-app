import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  FETCH_ARTISTS,
  OPEN_ARTIST_WINDOW,
  OPEN_ENTRY_WINDOW,
  QUERY_ARTIST,
} from "@/constants/ipcEvents";
import type { FetchArtistsParams } from "@/types/artists";
import type {
  CreateArtistWindowParams,
  CreateEntryWindowParams,
} from "@/types/entries";

const api = {
  fetchArtists: (params: FetchArtistsParams) =>
    ipcRenderer.invoke(FETCH_ARTISTS, params),
  queryArtists: (query: string) => ipcRenderer.invoke(QUERY_ARTIST, query),
  openNewArtistWindow: (params: CreateArtistWindowParams) =>
    ipcRenderer.send(OPEN_ARTIST_WINDOW, params),
  openNewEntryWindow: (params: CreateEntryWindowParams) =>
    ipcRenderer.send(OPEN_ENTRY_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
