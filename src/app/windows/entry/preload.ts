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
import type { CreateMusicalReleaseInput } from "@/types/releases";

const api = {
  fetchCountries: () => ipcRenderer.invoke(FETCH_COUNTRIES),
  fetchLabels: () => ipcRenderer.invoke(FETCH_LABELS),
  fetchReleasesFormats: () => ipcRenderer.invoke(FETCH_RELEASE_FORMATS),
  fetchTags: () => ipcRenderer.invoke(FETCH_TAGS),
  getEntryById: (entryId: string) =>
    ipcRenderer.invoke(GET_ENTRY_BY_ID, entryId),
  getEntryReleases: (entryId: string) =>
    ipcRenderer.invoke(GET_ENTRY_RELEASES, entryId),
  getReleaseById: (releaseId: string) =>
    ipcRenderer.invoke(GET_RELEASE_BY_ID, releaseId),
  createMusicalRelease: (input: CreateMusicalReleaseInput) =>
    ipcRenderer.invoke(CREATE_MUSICAL_RELEASE, input),
  deleteRelease: (releaseId: string) =>
    ipcRenderer.invoke(DELETE_RELEASE, releaseId),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
