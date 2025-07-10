import { contextBridge, ipcRenderer } from 'electron';

import type { API } from './api';

const api: API = {
  getArtists: () => ipcRenderer.invoke('get-artists'),
};

contextBridge.exposeInMainWorld('api', api);
