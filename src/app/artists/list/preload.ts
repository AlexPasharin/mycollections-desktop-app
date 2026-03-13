import { contextBridge, ipcRenderer } from "electron";

import type { API, OpenArtistEntriesWindowParams } from "./api";

import {
  FETCH_ARTISTS,
  OPEN_ARTIST_ENTRIES_LIST_WINDOW,
} from "@/constants/ipcEvents";
import type { FetchArtistsParams } from "@/types/artists";

const api = {
  fetchArtists: (params: FetchArtistsParams) =>
    ipcRenderer.invoke(FETCH_ARTISTS, params),
  openNewArtistEntriesListWindow: (params: OpenArtistEntriesWindowParams) =>
    ipcRenderer.send(OPEN_ARTIST_ENTRIES_LIST_WINDOW, params),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
