import { type FC } from "react";

import type { EntrySearchResult } from "@/types/entries";
import { joinWithComma } from "@/utils/strings";

type EntriesListItemProps = {
  entry: EntrySearchResult;
  onOpenEntry: (entryId: string) => void;
  showArtistNames: boolean;
};

const EntriesListItem: FC<EntriesListItemProps> = ({
  entry,
  onOpenEntry,
  showArtistNames,
}) => {
  const { entryId, mainName, types, altNames, artists } = entry;

  // show only the main artists when the entry has any, otherwise all of its artists
  const mainArtists = artists.filter((artist) => artist.isEntriesMainArtist);
  const artistsToShow = mainArtists.length > 0 ? mainArtists : artists;
  const artistNamesJoined = showArtistNames
    ? joinWithComma(artistsToShow.map((artist) => artist.artistName))
    : "";
  const typesJoined = joinWithComma(types);
  const altNamesJoined = joinWithComma(altNames);

  return (
    <li>
      <button
        className="m-0 w-full origin-left cursor-pointer border-none bg-transparent py-[0.35rem] text-left text-inherit transition-transform duration-150 ease-in-out [font:inherit] hover:scale-[1.03] focus-visible:scale-[1.03]"
        type="button"
        onClick={() => {
          onOpenEntry(entryId);
        }}
      >
        <div>
          <span className="font-bold">{mainName}</span>
          {artistNamesJoined && (
            <span className="italic"> by {artistNamesJoined}</span>
          )}
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

export default EntriesListItem;
