import { app, BrowserWindow, ipcMain } from "electron";
import electronSquirrelStartup from "electron-squirrel-startup";
import type { Insertable } from "kysely";

import createArtistWindow from "./app/windows/artists/artist/createWindow";
import createEntryWindow from "./app/windows/entry/createWindow";
import createMainWindow from "./app/windows/main/create";
import type {
  CreateArtistWindowParams,
  CreateEntryWindowParams,
} from "./types/entries";

import {
  FETCH_ARTISTS,
  GET_ARTIST_BY_ID,
  GET_ENTRY_BY_ID,
  GET_ENTRY_RELEASES,
  GET_RELEASE_BY_ID,
  FETCH_RELEASE_FORMATS,
  FETCH_LABELS,
  FETCH_COUNTRIES,
  FETCH_TAGS,
  INSERT_MUSICAL_RELEASE,
  OPEN_ARTIST_WINDOW,
  OPEN_ENTRY_WINDOW,
  QUERY_ARTIST,
  SEARCH_ARTIST_ENTRIES,
} from "@/appConstants/ipcEvents";
import { fetchArtists, getArtistById, queryArtist } from "@/db/artists";
import { fetchCountries } from "@/db/countries";
import { getEntryById, searchArtistEntries } from "@/db/entries";
import { fetchReleasesFormats } from "@/db/formats";
import { fetchLabels } from "@/db/labels";
import {
  getEntryReleases,
  getReleaseById,
  insertMusicalRelease,
} from "@/db/releases";
import { fetchTags } from "@/db/tags";
import type { FetchArtistsParams } from "@/types/artists";
import type { MusicalRelease } from "@/types/db/database";
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
  ipcMain.handle(GET_ENTRY_BY_ID, (_, entryId: string) =>
    getEntryById(entryId),
  );
  ipcMain.handle(GET_ENTRY_RELEASES, (_, entryId: string) =>
    getEntryReleases(entryId),
  );
  ipcMain.handle(GET_RELEASE_BY_ID, (_, releaseId: string) =>
    getReleaseById(releaseId),
  );
  ipcMain.handle(
    INSERT_MUSICAL_RELEASE,
    (_, values: Insertable<MusicalRelease>) => insertMusicalRelease(values),
  );
  ipcMain.handle(FETCH_RELEASE_FORMATS, () => fetchReleasesFormats());
  ipcMain.handle(FETCH_LABELS, () => fetchLabels());
  ipcMain.handle(FETCH_COUNTRIES, () => fetchCountries());
  ipcMain.handle(FETCH_TAGS, () => fetchTags());
  ipcMain.handle(
    SEARCH_ARTIST_ENTRIES,
    (_, params: SearchArtistEntriesParams) => searchArtistEntries(params),
  );

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
