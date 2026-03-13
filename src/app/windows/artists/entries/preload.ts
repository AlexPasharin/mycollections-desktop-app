import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import { GET_ARTIST_BY_ID } from "@/constants/ipcEvents";

const api = {
  getArtistById: (artistId: string) =>
    ipcRenderer.invoke(GET_ARTIST_BY_ID, artistId),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
