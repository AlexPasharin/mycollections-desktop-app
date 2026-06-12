import { type FC, useEffect, useState } from "react";

import api from "./api";
import Entry from "./Entry";
import styles from "./EntryWindowWrapper.module.css";

import DbSourceSelect from "@/app/components/DbSourceSelect";
import type { DbSource } from "@/db/db-source";
import { parseDbSource } from "@/db/parse-db-source";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSyncSearchParam } from "@/hooks/useSyncSearchParam";
import type { EntryByIdResult } from "@/types/entries";

const EntryWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const entryId = params.get("entryId");

  console.info({ entryId });

  const [dbSource, setDbSource] = useState<DbSource>(
    parseDbSource(params.get("source")),
  );
  const [entry, setEntry] = useState<EntryByIdResult>();
  const [isLoading, setIsLoading] = useState(true);

  useSyncSearchParam("source", dbSource);

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

    api
      .getEntryById(entryId, dbSource)
      .then(setEntry)
      .catch((error: unknown) => {
        console.error("Error getting entry by id", error);
        setEntry(undefined);
      })
      .finally(() => setIsLoading(false));
  }, [entryId, dbSource]);

  if (!entryId) {
    const error = new Error("entryId is required");
    console.error(error);
    window.close();

    return null;
  }

  return (
    <div>
      <header className={styles.header}>
        <DbSourceSelect
          id="entry-db-source"
          value={dbSource}
          onChange={setDbSource}
        />
      </header>

      {isLoading ? (
        <p>Loading entry&apos;s details...</p>
      ) : entry ? (
        <Entry entry={entry} dbSource={dbSource} onEntryUpdated={setEntry} />
      ) : (
        <p>Entry not found.</p>
      )}
    </div>
  );
};

export default EntryWindowWrapper;
