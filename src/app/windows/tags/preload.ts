import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import { CREATE_TAG, FETCH_TAGS } from "@/appConstants/ipcEvents";
import type { DbSource } from "@/db/db-source";
import type { CreateTagInput } from "@/types/tags";

const api = {
  fetchTags: (dbSource: DbSource) => ipcRenderer.invoke(FETCH_TAGS, dbSource),
  createTag: (input: CreateTagInput, dbSource: DbSource) =>
    ipcRenderer.invoke(CREATE_TAG, input, dbSource),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
