import { type FC, useEffect, useState } from "react";

import api from "./api";
import ArtistAddEntryForm from "./ArtistAddEntryForm";
import ArtistInfo from "./ArtistEntriesContent/ArtistInfo";
import ArtistEntriesSearch from "./ArtistEntriesSearch";

import DbSourceSelect from "@/app/components/DbSourceSelect";
import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import Tabs from "@/app/components/Tabs";
import type { DbSource } from "@/db/db-source";
import { parseDbSource } from "@/db/parse-db-source";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSyncSearchParam } from "@/hooks/useSyncSearchParam";
import type { ArtistByIdResult } from "@/types/artists";

type ArtistEntriesTab = "searchEntries" | "addEntry";

/** Stable ids for this tablist (single Artist view per document). */
const SEARCH_ENTRIES_TAB_ID = "artist-search-entries-tab";
const SEARCH_ENTRIES_PANEL_ID = "artist-search-entries-panel";
const ADD_ENTRY_TAB_ID = "artist-add-entry-tab";
const ADD_ENTRY_PANEL_ID = "artist-add-entry-panel";
const CREATE_ENTRY_NOTIFICATIONS_ID = "artist-create-entry-notifications";
const CREATE_ENTRY_ERRORS_ID = "artist-create-entry-errors";

const ArtistWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artistId");

  const [primaryDbSource, setPrimaryDbSource] = useState<DbSource>(
    parseDbSource(params.get("source")),
  );
  const [artist, setArtist] = useState<ArtistByIdResult>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ArtistEntriesTab>("searchEntries");
  const [createEntryNotifications, setCreateEntryNotifications] = useState<
    string[]
  >([]);
  const [createEntryErrors, setCreateEntryErrors] = useState<string[]>([]);

  useSyncSearchParam("source", primaryDbSource);

  const title = isLoading
    ? "Artist View - Loading...."
    : artist
      ? `Artist View - ${artist.name}`
      : "Artist View";

  useDocumentTitle(title);

  useEffect(() => {
    setCreateEntryNotifications([]);
    setCreateEntryErrors([]);
  }, [primaryDbSource]);

  useEffect(() => {
    if (!artistId) {
      return;
    }

    setIsLoading(true);

    api
      .getArtistById(artistId, primaryDbSource)
      .then(setArtist)
      .catch((error: unknown) => {
        console.error("Error getting artist by id", error);
        setArtist(undefined);
      })
      .finally(() => setIsLoading(false));
  }, [artistId, primaryDbSource]);

  if (!artistId) {
    const error = new Error("artistId is required");
    console.error(error);
    window.close();

    return null;
  }

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <h1 className="m-0">Artist view</h1>
        <DbSourceSelect
          id="artist-db-source"
          value={primaryDbSource}
          onChange={setPrimaryDbSource}
        />
      </header>

      {isLoading ? (
        <p>Loading...</p>
      ) : artist ? (
        <>
          <ArtistInfo artist={artist} />

          <FormFieldNotifications
            id={CREATE_ENTRY_NOTIFICATIONS_ID}
            messages={createEntryNotifications.map((notification) => ({
              notification,
            }))}
          />
          <FormFieldErrorMessages
            id={CREATE_ENTRY_ERRORS_ID}
            messages={createEntryErrors.map((message) => ({ message }))}
          />

          <Tabs
            ariaLabel="Search artist entries or add a new entry"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              {
                id: "searchEntries",
                tabId: SEARCH_ENTRIES_TAB_ID,
                panelId: SEARCH_ENTRIES_PANEL_ID,
                label: "Search entries",
                children: (
                  <ArtistEntriesSearch
                    artistId={artistId}
                    dbSource={primaryDbSource}
                  />
                ),
              },
              {
                id: "addEntry",
                tabId: ADD_ENTRY_TAB_ID,
                panelId: ADD_ENTRY_PANEL_ID,
                label: "Add new entry",
                children: (
                  <ArtistAddEntryForm
                    artistId={artistId}
                    primaryDbSource={primaryDbSource}
                    onCancel={() => setActiveTab("searchEntries")}
                    onEntrySaved={(notifications, errors) => {
                      setCreateEntryNotifications(notifications);
                      setCreateEntryErrors(errors);
                    }}
                  />
                ),
              },
            ]}
          />
        </>
      ) : (
        <p>Artist does not exist</p>
      )}
    </div>
  );
};

export default ArtistWindowWrapper;
