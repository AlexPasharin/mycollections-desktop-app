import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  GET_ARTIST_BY_ID,
  SEARCH_ENTRIES_BY_ARTIST,
} from "@/constants/ipcEvents";
import type { SearchEntriesByArtistParams } from "@/types/entries";

const api = {
  getArtistById: (artistId: string) =>
    ipcRenderer.invoke(GET_ARTIST_BY_ID, artistId),
  searchEntriesByArtist: (params: SearchEntriesByArtistParams) =>
    ipcRenderer.invoke(SEARCH_ENTRIES_BY_ARTIST, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
