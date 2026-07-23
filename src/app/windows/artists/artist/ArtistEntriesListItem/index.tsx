import { type FC } from "react";

import api from "../api";

import type { DbSource } from "@/db/db-source";
import type { EntrySearchResult } from "@/types/entries";

type ArtistEntriesListItemProps = {
  entry: EntrySearchResult;
  dbSource: DbSource;
};

const ArtistEntriesListItem: FC<ArtistEntriesListItemProps> = ({
  entry,
  dbSource,
}) => {
  const { entryId, mainName, types, altNames } = entry;
  const typesJoined = types.length > 0 ? types.join(", ") : null;
  const altNamesJoined = altNames.length > 0 ? altNames.join(", ") : null;

  return (
    <li>
      <button
        className="m-0 w-full origin-left cursor-pointer border-none bg-transparent py-[0.35rem] text-left text-inherit transition-transform duration-150 ease-in-out [font:inherit] hover:scale-[1.03] focus-visible:scale-[1.03]"
        type="button"
        onClick={() => {
          api.openNewEntryWindow({ entryId, source: dbSource });
        }}
      >
        <div>
          <span className="font-bold">{mainName}</span>
          {typesJoined && <span> ({typesJoined})</span>}
        </div>
        {altNamesJoined && (
          <div className="mt-[0.2rem] italic">
            also known as: {altNamesJoined}
          </div>
        )}
      </button>
    </li>
  );
};

export default ArtistEntriesListItem;
