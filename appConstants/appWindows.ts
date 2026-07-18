export const MAIN_WINDOW = "main_window";
export const ARTIST_WINDOW = "artist_window";
export const ENTRY_WINDOW = "entry_window";
export const TAGS_WINDOW = "tags_window";
export const LABELS_WINDOW = "labels_window";

export type AppWindowName =
  | typeof MAIN_WINDOW
  | typeof ARTIST_WINDOW
  | typeof ENTRY_WINDOW
  | typeof TAGS_WINDOW
  | typeof LABELS_WINDOW;
