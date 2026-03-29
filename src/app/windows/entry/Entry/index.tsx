import { type FC } from "react";

import EntryArtists from "./EntryArtists";
import EntryDetailsPanel from "./EntryDetailsPanel";

import type { EntryByIdResult } from "@/types/entries";
import type { EntryRelease } from "@/types/releases";

type EntryProps = {
  entry: EntryByIdResult;
  releases: EntryRelease[];
};

const Entry: FC<EntryProps> = ({ entry, releases }) => (
  <div>
    <h1>{entry.mainName}</h1>

    <EntryArtists artists={entry.artists} />

    <EntryDetailsPanel entry={entry} releases={releases} />
  </div>
);

export default Entry;
