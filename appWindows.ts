import type { AppWindowName } from "constants/appWindows";

const appWindows = {
  main_window: {
    folder: "windows/main",
  },
  artists_list_window: {
    folder: "windows/artists/list",
  },
  artist_query_window: {
    folder: "windows/artists/query",
  },
  artist_entries_window: {
    folder: "windows/artists/entries",
  },
} as const satisfies Record<
  AppWindowName,
  {
    folder: `windows/${string}`;
  }
>;

export default appWindows;
