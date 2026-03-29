import type { AppWindowName } from "constants/appWindows";

const appWindows = {
  main_window: {
    folder: "windows/main",
  },
  artists_list_window: {
    folder: "windows/artists/list",
  },
  artist_window: {
    folder: "windows/artists/artist",
  },
  entry_window: {
    folder: "windows/entry",
  },
} as const satisfies Record<
  AppWindowName,
  {
    folder: `windows/${string}`;
  }
>;

export default appWindows;
