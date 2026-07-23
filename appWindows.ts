import type { AppWindowName } from "@/appConstants/appWindows";

const appWindows = {
  main_window: {
    folder: "windows/main",
  },
  artist_window: {
    folder: "windows/artist",
  },
  entry_window: {
    folder: "windows/entry",
  },
  tags_window: {
    folder: "windows/tags",
  },
  labels_window: {
    folder: "windows/labels",
  },
} as const satisfies Record<
  AppWindowName,
  {
    folder: `windows/${string}`;
  }
>;

export default appWindows;
