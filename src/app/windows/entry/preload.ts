import { contextBridge, ipcRenderer } from "electron";
import type { Insertable } from "kysely";

import type { API } from "./api";

import {
  FETCH_COUNTRIES,
  FETCH_LABELS,
  FETCH_RELEASE_FORMATS,
  FETCH_TAGS,
  GET_ENTRY_BY_ID,
  GET_ENTRY_RELEASES,
  GET_RELEASE_BY_ID,
  INSERT_MUSICAL_RELEASE,
} from "@/appConstants/ipcEvents";
import type { MusicalRelease } from "@/types/db/database";

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
  insertMusicalRelease: (values: Insertable<MusicalRelease>) =>
    ipcRenderer.invoke(INSERT_MUSICAL_RELEASE, values),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
