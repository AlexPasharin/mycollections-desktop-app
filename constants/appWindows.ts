export const MAIN_WINDOW = "main_window";
export const ARTISTS_LIST_WINDOW = "artists_list_window";
export const ARTIST_QUERY_WINDOW = "artist_query_window";

export type AppWindowName =
  | typeof MAIN_WINDOW
  | typeof ARTISTS_LIST_WINDOW
  | typeof ARTIST_QUERY_WINDOW;
