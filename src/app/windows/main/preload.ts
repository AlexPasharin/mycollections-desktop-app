import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  FETCH_ARTISTS,
  OPEN_ARTIST_WINDOW,
  OPEN_TAGS_WINDOW,
  QUERY_ARTIST,
} from "@/appConstants/ipcEvents";
import type { CreateArtistWindowParams } from "@/types/entries";
import type { CreateTagsWindowParams } from "@/types/tags";

const api = {
  fetchArtists: (params, dbSource) =>
    ipcRenderer.invoke(FETCH_ARTISTS, params, dbSource),
  queryArtists: (query, dbSource) =>
    ipcRenderer.invoke(QUERY_ARTIST, query, dbSource),
  openNewArtistWindow: (params: CreateArtistWindowParams) =>
    ipcRenderer.send(OPEN_ARTIST_WINDOW, params),
  openNewTagsWindow: (params: CreateTagsWindowParams) =>
    ipcRenderer.send(OPEN_TAGS_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
