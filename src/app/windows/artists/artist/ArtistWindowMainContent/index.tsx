import { useEffect, useRef, useState, type FC } from "react";

import ArtistAddEntryForm from "../ArtistAddEntryForm";
import ArtistInfo from "../ArtistEntriesContent/ArtistInfo";
import ArtistEntriesSearch from "../ArtistEntriesSearch";
import ArtistUpsertForm from "../ArtistUpsertForm";

import FeedbackSection from "@/app/components/FeedbackSection";
import Tabs from "@/app/components/Tabs";
import type { UpsertEntryFormPersistedState } from "@/app/components/UpsertEntryForm/upsertEntryFormUtils/formValues";
import type { DbSource } from "@/db/db-source";
import type { ArtistByIdResult } from "@/types/artists";
import type { FormFeedback } from "@/types/form";
import { formFeedbackInitialValue } from "@/utils/form";

type ArtistEntriesTab = "searchEntries" | "addEntry" | "updateArtist";

type ArtistWindowMainContentProps = {
  artist: ArtistByIdResult;
  artistId: string;
  primaryDbSource: DbSource;
  onArtistUpdated: (artist: ArtistByIdResult) => void;
};

/** Stable ids for this tablist (single Artist view per document). */
const SEARCH_ENTRIES_TAB_ID = "artist-search-entries-tab";
const SEARCH_ENTRIES_PANEL_ID = "artist-search-entries-panel";
const ADD_ENTRY_TAB_ID = "artist-add-entry-tab";
const ADD_ENTRY_PANEL_ID = "artist-add-entry-panel";
const UPDATE_ARTIST_TAB_ID = "artist-update-artist-tab";
const UPDATE_ARTIST_PANEL_ID = "artist-update-artist-panel";
const CREATE_ENTRY_NOTIFICATIONS_ID = "artist-create-entry-notifications";
const CREATE_ENTRY_ERRORS_ID = "artist-create-entry-errors";
const UPDATE_ARTIST_NOTIFICATIONS_ID = "artist-update-artist-notifications";
const UPDATE_ARTIST_ERRORS_ID = "artist-update-artist-errors";

const ArtistWindowMainContent: FC<ArtistWindowMainContentProps> = ({
  artist,
  artistId,
  primaryDbSource,
  onArtistUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<ArtistEntriesTab>("searchEntries");
  const [searchEntriesQuery, setSearchEntriesQuery] = useState("");
  const [createEntryFeedback, setCreateEntryFeedback] = useState<FormFeedback>(
    formFeedbackInitialValue,
  );
  const [updateArtistFeedback, setUpdateArtistFeedback] =
    useState<FormFeedback>(formFeedbackInitialValue);
  const createEntryDraftRef = useRef<UpsertEntryFormPersistedState | null>(
    null,
  );

  useEffect(() => {
    setCreateEntryFeedback(formFeedbackInitialValue);
    setUpdateArtistFeedback(formFeedbackInitialValue);
  }, [primaryDbSource]);

  const handleClearUpdateArtistFeedback = () => {
    setUpdateArtistFeedback(formFeedbackInitialValue);
  };

  const handleArtistUpdated = (result: {
    artist: ArtistByIdResult;
    feedback: FormFeedback;
  }) => {
    onArtistUpdated(result.artist);
    setUpdateArtistFeedback(result.feedback);
  };

  return (
    <main>
      <ArtistInfo artist={artist} />

      <FeedbackSection
        notificationsId={CREATE_ENTRY_NOTIFICATIONS_ID}
        errorsId={CREATE_ENTRY_ERRORS_ID}
        notifications={createEntryFeedback.notifications}
        errors={createEntryFeedback.errors}
      />

      <FeedbackSection
        notificationsId={UPDATE_ARTIST_NOTIFICATIONS_ID}
        errorsId={UPDATE_ARTIST_ERRORS_ID}
        notifications={updateArtistFeedback.notifications}
        errors={updateArtistFeedback.errors}
      />

      <Tabs
        ariaLabel="Search artist entries, add a new entry, or update the artist"
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
                query={searchEntriesQuery}
                onQueryChange={setSearchEntriesQuery}
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
                createEntryDraftRef={createEntryDraftRef}
                onCancel={() => setActiveTab("searchEntries")}
                onEntrySaved={setCreateEntryFeedback}
              />
            ),
          },
          {
            id: "updateArtist",
            tabId: UPDATE_ARTIST_TAB_ID,
            panelId: UPDATE_ARTIST_PANEL_ID,
            label: "Update artist",
            children: (
              <ArtistUpsertForm
                artist={artist}
                primaryDbSource={primaryDbSource}
                onClearFeedback={handleClearUpdateArtistFeedback}
                onArtistUpdated={handleArtistUpdated}
              />
            ),
          },
        ]}
      />
    </main>
  );
};

export default ArtistWindowMainContent;
