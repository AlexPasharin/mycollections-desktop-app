import { app, BrowserWindow, ipcMain } from "electron";
import electronSquirrelStartup from "electron-squirrel-startup";

import createArtistsListWindow from "./app/artists/list/createWindow";
import createArtistQueryWindow from "./app/artists/query/createWindow";
import createMainWindow from "./app/mainWindow/create";

import { fetchArtists, queryArtist } from "@/db/artists";
import type { FetchArtistsParams } from "@/types/artists";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
await app.whenReady().then(async () => {
  ipcMain.handle("fetch-artists", (_, params: FetchArtistsParams) =>
    fetchArtists(params),
  );

  ipcMain.handle("query-artists", (_, query: string) => queryArtist(query));

  ipcMain.on("open-new-artists-list-window", () => {
    void createArtistsListWindow();
  });

  ipcMain.on("open-new-artist-query-window", () => {
    void createArtistQueryWindow();
  });

  await createMainWindow();

  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
