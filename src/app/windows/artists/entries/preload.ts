import { contextBridge } from "electron";

import type { API } from "./api";

const api = {} as const satisfies API;

contextBridge.exposeInMainWorld("api", api);
