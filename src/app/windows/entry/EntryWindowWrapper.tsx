import { type FC, useEffect, useState } from "react";

import api from "./api";
import Entry from "./Entry";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { EntryByIdResult } from "@/types/entries";
import type { EntryRelease } from "@/types/releases";

const EntryWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const entryId = params.get("entryId");

  const [entry, setEntry] = useState<EntryByIdResult>();
  const [releases, setReleases] = useState<EntryRelease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const title = isLoading
    ? "Entry View - Loading...."
    : entry
      ? `Entry View - ${entry.mainName}`
      : "Entry View";

  useDocumentTitle(title);

  useEffect(() => {
    if (!entryId) {
      return;
    }

    setIsLoading(true);

    Promise.all([
      api.getEntryById(entryId).catch((error: unknown) => {
        console.error("Error getting entry by id", error);

        throw error;
      }),
      api.getEntryReleases(entryId).catch((error: unknown) => {
        console.error("Error getting entry releases", error);

        throw error;
      }),
    ])
      .then(([entryData, releasesData]) => {
        setEntry(entryData);
        setReleases(releasesData);
      })
      .catch(() => {
        setEntry(undefined);
        setReleases([]);
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
        <Entry entry={entry} releases={releases} />
      ) : (
        <p>Entry not found.</p>
      )}
    </div>
  );
};

export default EntryWindowWrapper;
