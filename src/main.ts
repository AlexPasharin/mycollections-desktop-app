import { app, BrowserWindow, ipcMain } from "electron";
import electronSquirrelStartup from "electron-squirrel-startup";

import createArtistWindow from "./app/windows/artists/artist/createWindow";
import createArtistsListWindow from "./app/windows/artists/list/createWindow";
import createArtistQueryWindow from "./app/windows/artists/query/createWindow";
import createEntryWindow from "./app/windows/entry/createWindow";
import createMainWindow from "./app/windows/main/create";
import type {
  CreateArtistWindowParams,
  CreateEntryWindowParams,
} from "./types/entries";

import {
  FETCH_ARTISTS,
  GET_ARTIST_BY_ID,
  OPEN_ARTIST_WINDOW,
  OPEN_ARTIST_QUERY_WINDOW,
  OPEN_ARTISTS_LIST_WINDOW,
  OPEN_ENTRY_WINDOW,
  QUERY_ARTIST,
  SEARCH_ARTIST_ENTRIES,
} from "@/constants/ipcEvents";
import { fetchArtists, getArtistById, queryArtist } from "@/db/artists";
import { searchArtistEntries } from "@/db/entries/searchArtistEntries";
import type { FetchArtistsParams } from "@/types/artists";
import type { SearchArtistEntriesParams } from "@/types/entries";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
await app.whenReady().then(async () => {
  ipcMain.handle(FETCH_ARTISTS, (_, params: FetchArtistsParams) =>
    fetchArtists(params),
  );

  ipcMain.handle(QUERY_ARTIST, (_, query: string) => queryArtist(query));
  ipcMain.handle(GET_ARTIST_BY_ID, (_, artistId: string) =>
    getArtistById(artistId),
  );
  ipcMain.handle(
    SEARCH_ARTIST_ENTRIES,
    (_, params: SearchArtistEntriesParams) => searchArtistEntries(params),
  );

  ipcMain.on(OPEN_ARTISTS_LIST_WINDOW, () => {
    void createArtistsListWindow();
  });

  ipcMain.on(OPEN_ARTIST_QUERY_WINDOW, () => {
    void createArtistQueryWindow();
  });

  ipcMain.on(OPEN_ARTIST_WINDOW, (_event, params: CreateArtistWindowParams) => {
    void createArtistWindow(params);
  });

  ipcMain.on(OPEN_ENTRY_WINDOW, (_event, params: CreateEntryWindowParams) => {
    void createEntryWindow(params);
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
