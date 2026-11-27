import { useRef, useState, type FC } from "react";

import type { DbSource } from "@/db/db-source";
import type { GeneralizedDateFromDb } from "@/types/date";
import type {
  ArtistEntry,
  ArtistEntriesTypeGroup,
  FetchArtistEntriesOfType,
} from "@/types/entries";

const ARTIST_ENTRIES_BATCH_SIZE = 10;

type ArtistEntriesGroupProps = {
  artistId: string;
  dbSource: DbSource;
  group: ArtistEntriesTypeGroup;
  onFetchGroupEntries: FetchArtistEntriesOfType;
  onOpenEntry: (entryId: string) => void;
};

const buttonClassName =
  "cursor-pointer border-none bg-transparent p-0 text-inherit underline [font:inherit] disabled:cursor-default disabled:no-underline";

const ArtistEntriesGroup: FC<ArtistEntriesGroupProps> = ({
  artistId,
  dbSource,
  group,
  onFetchGroupEntries,
  onOpenEntry,
}) => {
  const { typeId, typeName, entriesCount } = group;

  const [entries, setEntries] = useState<ArtistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [entriesFetchFailed, setEntriesFetchFailed] = useState(false);

  const isRequestInFlightRef = useRef(false);
  const hasBeenOpenedRef = useRef(false);

  const loadEntries = (limit?: number) => {
    if (isRequestInFlightRef.current) {
      return;
    }

    isRequestInFlightRef.current = true;
    setIsLoading(true);
    setEntriesFetchFailed(false);

    onFetchGroupEntries(
      {
        artistId,
        typeId,
        offset: entries.length,
        limit,
      },
      dbSource,
    )
      .then((fetched) => {
        setEntries((previous) => [...previous, ...fetched]);
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch group entries", error);
        setEntriesFetchFailed(true);
      })
      .finally(() => {
        isRequestInFlightRef.current = false;
        setIsLoading(false);
      });
  };

  const handleToggle = (isOpen: boolean) => {
    // entries are fetched only when the group is opened for the first time
    if (isOpen && !hasBeenOpenedRef.current) {
      hasBeenOpenedRef.current = true;
      loadEntries(ARTIST_ENTRIES_BATCH_SIZE);
    }
  };

  const remainingCount = entriesCount - entries.length;

  return (
    <details
      className="mt-2 border-b border-neutral-200 pb-2"
      onToggle={(event) => {
        handleToggle(event.currentTarget.open);
      }}
    >
      <summary className="cursor-pointer font-bold">
        {typeName} ({entriesCount})
      </summary>

      <ol className="mt-2 list-decimal pl-6">
        {entries.map(({ entryId, mainName, originalReleaseDate }) => {
          const releaseYear = getReleaseYear(originalReleaseDate);

          return (
            <li key={entryId}>
              <button
                className="m-0 block w-full origin-left cursor-pointer border-none bg-transparent py-[0.35rem] text-left text-inherit transition-transform duration-150 ease-in-out [font:inherit] hover:scale-[1.03] focus-visible:scale-[1.03]"
                type="button"
                onClick={() => {
                  onOpenEntry(entryId);
                }}
              >
                <span className="font-bold">{mainName}</span>
                {releaseYear !== undefined && <span> ({releaseYear})</span>}
              </button>
            </li>
          );
        })}
      </ol>

      {isLoading && <p>Loading…</p>}
      {entriesFetchFailed && <p>Failed to load entries.</p>}

      {!isLoading && remainingCount > 0 && (
        <div className="mt-1 flex gap-4">
          {/* when the next batch is the last one, "Show next" is redundant since "Show all" does the same */}
          {remainingCount > ARTIST_ENTRIES_BATCH_SIZE && (
            <button
              className={buttonClassName}
              type="button"
              onClick={() => {
                loadEntries(ARTIST_ENTRIES_BATCH_SIZE);
              }}
            >
              Show next {ARTIST_ENTRIES_BATCH_SIZE}
            </button>
          )}
          <button
            className={buttonClassName}
            type="button"
            onClick={() => {
              loadEntries();
            }}
          >
            Show all ({remainingCount} more)
          </button>
        </div>
      )}
    </details>
  );
};

export default ArtistEntriesGroup;

const getReleaseYear = (date: GeneralizedDateFromDb): number | undefined =>
  date !== null && "year" in date ? date.year : undefined;
