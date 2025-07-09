import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('data', {
  getArtists: () => ipcRenderer.invoke('get-artists'),
});
