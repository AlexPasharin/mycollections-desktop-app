import type { AppWindowName } from "constants/appWindows";

const appWindows = {
  main_window: {
    folder: "mainWindow",
  },
  artists_list_window: {
    folder: "artists/list",
  },
  artist_query_window: {
    folder: "artists/query",
  },
  artist_entries_window: {
    folder: "artists/entries",
  },
} as const satisfies Record<
  AppWindowName,
  {
    folder: string;
  }
>;

export default appWindows;
