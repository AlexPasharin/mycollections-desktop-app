import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import {
  FETCH_COUNTRIES,
  FETCH_LABELS,
  FETCH_RELEASE_FORMATS,
  FETCH_TAGS,
  GET_ENTRY_BY_ID,
  GET_ENTRY_RELEASES,
  GET_RELEASE_BY_ID,
  CREATE_MUSICAL_RELEASE,
  DELETE_RELEASE,
} from "@/appConstants/ipcEvents";
import type { DbSource } from "@/db/db-source";
import type { CreateMusicalReleaseInput } from "@/types/releases";

const api = {
  fetchCountries: (dbSource: DbSource) =>
    ipcRenderer.invoke(FETCH_COUNTRIES, dbSource),
  fetchLabels: (dbSource: DbSource) =>
    ipcRenderer.invoke(FETCH_LABELS, dbSource),
  fetchReleasesFormats: (dbSource: DbSource) =>
    ipcRenderer.invoke(FETCH_RELEASE_FORMATS, dbSource),
  fetchTags: (dbSource: DbSource) => ipcRenderer.invoke(FETCH_TAGS, dbSource),
  getEntryById: (entryId: string, dbSource: DbSource) =>
    ipcRenderer.invoke(GET_ENTRY_BY_ID, entryId, dbSource),
  getEntryReleases: (entryId: string, dbSource: DbSource) =>
    ipcRenderer.invoke(GET_ENTRY_RELEASES, entryId, dbSource),
  getReleaseById: (releaseId: string, dbSource: DbSource) =>
    ipcRenderer.invoke(GET_RELEASE_BY_ID, releaseId, dbSource),
  createMusicalRelease: (
    input: CreateMusicalReleaseInput,
    dbSource: DbSource,
  ) => ipcRenderer.invoke(CREATE_MUSICAL_RELEASE, input, dbSource),
  deleteRelease: (releaseId: string, dbSource: DbSource) =>
    ipcRenderer.invoke(DELETE_RELEASE, releaseId, dbSource),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
