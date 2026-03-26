import { type FC, useEffect, useState } from "react";

import api from "./api";
import EntryDetails from "./EntryDetails";

import type { EntryByIdResult } from "@/types/entries";

const EntryWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const entryId = params.get("entryId");

  const [entry, setEntry] = useState<EntryByIdResult>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!entryId) {
      return;
    }

    setIsLoading(true);

    api
      .getEntryById(entryId)
      .then(setEntry)
      .catch((error: unknown) => {
        console.error("Error getting entry by id", error);
        setEntry(undefined);
      })
      .finally(() => setIsLoading(false));
  }, [entryId]);

  if (!entryId) {
    const error = new Error("entryId is required");
    console.error(error);
    window.close();

    return null;
  }

  return (
    <div>
      {isLoading ? (
        <p>Loading entry&apos;s details...</p>
      ) : entry ? (
        <EntryDetails entry={entry} />
      ) : (
        <p>Entry not found.</p>
      )}
    </div>
  );
};

export default EntryWindowWrapper;
