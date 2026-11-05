import type { FC } from "react";

import api from "../../../api";

import type { DbSource } from "@/db/db-source";
import type { EntryByIdResult } from "@/types/entries";

type ArtistAddEntrySuccessProps = {
  entry: EntryByIdResult;
  primaryDbSource: DbSource;
  onDismiss: () => void;
};

const openEntryButtonClassName =
  "mt-4 cursor-pointer rounded-md border border-indigo-600 bg-indigo-600 px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-white transition-[background,border-color] duration-150 ease-in-out hover:border-indigo-700 hover:bg-indigo-700";

const backButtonClassName =
  "ml-2 mt-4 cursor-pointer rounded-md border border-indigo-600 bg-white px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-indigo-600 transition-[background,border-color] duration-150 ease-in-out hover:bg-indigo-50";

const ArtistAddEntrySuccess: FC<ArtistAddEntrySuccessProps> = ({
  entry,
  primaryDbSource,
  onDismiss,
}) => (
  <div className="mt-4" role="status">
    <p className="m-0 text-xl font-bold">
      Entry &quot;{entry.mainName}&quot; successfully created!
    </p>
    <button
      type="button"
      className={openEntryButtonClassName}
      onClick={() => {
        api.openNewEntryWindow({
          entryId: entry.entryId,
          source: primaryDbSource,
        });
      }}
    >
      Open window for new entry
    </button>
    <button
      type="button"
      className={backButtonClassName}
      onClick={onDismiss}
    >
      Back to form
    </button>
  </div>
);

export default ArtistAddEntrySuccess;
