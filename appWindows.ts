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
} as const satisfies Record<
  AppWindowName,
  {
    folder: string;
  }
>;

export default appWindows;
