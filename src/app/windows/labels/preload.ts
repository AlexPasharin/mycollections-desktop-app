import { contextBridge, ipcRenderer } from "electron";

import type { API } from "./api";

import { CREATE_LABEL, FETCH_LABELS } from "@/appConstants/ipcEvents";
import type { DbSource } from "@/db/db-source";
import type { CreateLabelInput } from "@/types/labels";

const api = {
  fetchLabels: (dbSource: DbSource) =>
    ipcRenderer.invoke(FETCH_LABELS, dbSource),
  createLabel: (input: CreateLabelInput, dbSource: DbSource) =>
    ipcRenderer.invoke(CREATE_LABEL, input, dbSource),
} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
