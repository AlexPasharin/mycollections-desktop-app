import { app, BrowserWindow, ipcMain } from "electron";
import electronSquirrelStartup from "electron-squirrel-startup";

import createArtistWindow from "./app/windows/artists/artist/createWindow";
import createEntryWindow from "./app/windows/entry/createWindow";
import createMainWindow from "./app/windows/main/create";
import createTagsWindow from "./app/windows/tags/createWindow";
import type {
  CreateArtistWindowParams,
  CreateEntryWindowParams,
} from "./types/entries";

import {
  FETCH_ARTISTS,
  GET_ARTIST_BY_ID,
  GET_ENTRY_BY_ID,
  GET_ENTRY_RELEASES,
  GET_ENTRY_RELEASE_TAG_IDS,
  GET_RELEASE_BY_ID,
  FETCH_RELEASE_FORMATS,
  FETCH_LABELS,
  FETCH_COUNTRIES,
  FETCH_TAGS,
  CREATE_TAG,
  FETCH_ENTRY_TYPES,
  CREATE_MUSICAL_ENTRY,
  UPDATE_MUSICAL_ENTRY,
  CREATE_MUSICAL_RELEASE,
  UPDATE_MUSICAL_RELEASE,
  DELETE_RELEASE,
  OPEN_ARTIST_WINDOW,
  OPEN_ENTRY_WINDOW,
  OPEN_TAGS_WINDOW,
  QUERY_ARTIST,
  SEARCH_ARTIST_ENTRIES,
} from "@/appConstants/ipcEvents";
import { fetchArtists, getArtistById, queryArtist } from "@/db/artists";
import { fetchCountries } from "@/db/countries";
import type { DbSource } from "@/db/db-source";
import {
  createMusicalEntry,
  fetchEntryTypes,
  getEntryById,
  searchArtistEntries,
  updateMusicalEntry,
} from "@/db/entries";
import { fetchReleasesFormats } from "@/db/formats";
import { fetchLabels } from "@/db/labels";
import {
  createMusicalRelease,
  deleteRelease,
  getEntryReleases,
  getEntryReleaseTagIds,
  getReleaseById,
  updateMusicalRelease,
} from "@/db/releases";
import { fetchTags, createTag } from "@/db/tags";
import type { FetchArtistsParams } from "@/types/artists";
import type {
  CreateMusicalEntryInput,
  SearchArtistEntriesParams,
  UpdateMusicalEntryInput,
} from "@/types/entries";
import type {
  CreateMusicalReleaseInput,
  UpdateMusicalReleaseInput,
} from "@/types/releases";
import type { CreateTagInput, CreateTagsWindowParams } from "@/types/tags";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
await app.whenReady().then(async () => {
  ipcMain.handle(
    FETCH_ARTISTS,
    (_, params: FetchArtistsParams, dbSource: DbSource) =>
      fetchArtists(params, dbSource),
  );

  ipcMain.handle(QUERY_ARTIST, (_, query: string, dbSource: DbSource) =>
    queryArtist(query, dbSource),
  );
  ipcMain.handle(GET_ARTIST_BY_ID, (_, artistId: string, dbSource: DbSource) =>
    getArtistById(artistId, dbSource),
  );
  ipcMain.handle(GET_ENTRY_BY_ID, (_, entryId: string, dbSource: DbSource) =>
    getEntryById(entryId, dbSource),
  );
  ipcMain.handle(GET_ENTRY_RELEASES, (_, entryId: string, dbSource: DbSource) =>
    getEntryReleases(entryId, dbSource),
  );
  ipcMain.handle(
    GET_ENTRY_RELEASE_TAG_IDS,
    (_, entryId: string, dbSource: DbSource) =>
      getEntryReleaseTagIds(entryId, dbSource),
  );
  ipcMain.handle(
    GET_RELEASE_BY_ID,
    (_, releaseId: string, dbSource: DbSource) =>
      getReleaseById(releaseId, dbSource),
  );
  ipcMain.handle(
    CREATE_MUSICAL_RELEASE,
    (_, input: CreateMusicalReleaseInput, dbSource: DbSource) =>
      createMusicalRelease(input, dbSource),
  );
  ipcMain.handle(
    UPDATE_MUSICAL_RELEASE,
    (_, input: UpdateMusicalReleaseInput, dbSource: DbSource) =>
      updateMusicalRelease(input, dbSource),
  );
  ipcMain.handle(DELETE_RELEASE, (_, releaseId: string, dbSource: DbSource) =>
    deleteRelease(releaseId, dbSource),
  );
  ipcMain.handle(FETCH_RELEASE_FORMATS, (_, dbSource: DbSource) =>
    fetchReleasesFormats(dbSource),
  );
  ipcMain.handle(FETCH_LABELS, (_, dbSource: DbSource) =>
    fetchLabels(dbSource),
  );
  ipcMain.handle(FETCH_COUNTRIES, (_, dbSource: DbSource) =>
    fetchCountries(dbSource),
  );
  ipcMain.handle(FETCH_TAGS, (_, dbSource: DbSource) => fetchTags(dbSource));
  ipcMain.handle(CREATE_TAG, (_, input: CreateTagInput, dbSource: DbSource) =>
    createTag(input, dbSource),
  );
  ipcMain.handle(FETCH_ENTRY_TYPES, (_, dbSource: DbSource) =>
    fetchEntryTypes(dbSource),
  );
  ipcMain.handle(
    CREATE_MUSICAL_ENTRY,
    (_, input: CreateMusicalEntryInput, dbSource: DbSource) =>
      createMusicalEntry(input, dbSource),
  );
  ipcMain.handle(
    UPDATE_MUSICAL_ENTRY,
    (_, input: UpdateMusicalEntryInput, dbSource: DbSource) =>
      updateMusicalEntry(input, dbSource),
  );
  ipcMain.handle(
    SEARCH_ARTIST_ENTRIES,
    (_, params: SearchArtistEntriesParams, dbSource: DbSource) =>
      searchArtistEntries(params, dbSource),
  );

  ipcMain.on(OPEN_ARTIST_WINDOW, (_event, params: CreateArtistWindowParams) => {
    void createArtistWindow(params);
  });

  ipcMain.on(OPEN_ENTRY_WINDOW, (_event, params: CreateEntryWindowParams) => {
    void createEntryWindow(params);
  });

  ipcMain.on(OPEN_TAGS_WINDOW, (_event, params: CreateTagsWindowParams) => {
    void createTagsWindow(params);
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
