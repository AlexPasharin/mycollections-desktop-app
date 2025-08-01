import type { AppWindowName } from "constants/appWindows";

// The magic constants auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).

// the rule those are generated by is simple - "name" of window is capitalized and then appended with either _WEBPACK_ENTRY (for html file) or with _PRELOAD_WEBPACK_ENTRY (for preload file)
// name of window is same as its key in "appWindows" map

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

declare const ARTISTS_LIST_WINDOW_WEBPACK_ENTRY: string;
declare const ARTISTS_LIST_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

declare const ARTIST_QUERY_WINDOW_WEBPACK_ENTRY: string;
declare const ARTIST_QUERY_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const appWindows = {
  main_window: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    html: MAIN_WINDOW_WEBPACK_ENTRY,
  },
  artists_list_window: {
    preload: ARTISTS_LIST_WINDOW_PRELOAD_WEBPACK_ENTRY,
    html: ARTISTS_LIST_WINDOW_WEBPACK_ENTRY,
  },
  artist_query_window: {
    preload: ARTIST_QUERY_WINDOW_PRELOAD_WEBPACK_ENTRY,
    html: ARTIST_QUERY_WINDOW_WEBPACK_ENTRY,
  },
} as const satisfies Record<
  AppWindowName,
  {
    preload: string;
    html: string;
  }
>;

export default appWindows;
