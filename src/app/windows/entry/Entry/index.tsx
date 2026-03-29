import { type FC } from "react";

import EntryArtists from "./EntryArtists";
import EntryDetailsPanel from "./EntryDetailsPanel";

import type { EntryByIdResult } from "@/types/entries";

type EntryProps = {
  entry: EntryByIdResult;
};

const Entry: FC<EntryProps> = ({ entry }) => (
  <div>
    <h1>{entry.mainName}</h1>

    <EntryArtists artists={entry.artists} />

    <EntryDetailsPanel entry={entry} />
  </div>
);

export default Entry;
