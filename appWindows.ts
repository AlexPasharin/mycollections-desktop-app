import type { AppWindowName } from "@/appConstants/appWindows";

const appWindows = {
  main_window: {
    folder: "windows/main",
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
