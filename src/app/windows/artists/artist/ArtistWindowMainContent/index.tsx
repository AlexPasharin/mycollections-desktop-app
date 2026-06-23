import { useEffect, useRef, useState, type FC } from "react";

import ArtistAddEntryForm from "../ArtistAddEntryForm";
import ArtistInfo from "../ArtistEntriesContent/ArtistInfo";
import ArtistEntriesSearch from "../ArtistEntriesSearch";

import FeedbackSection from "@/app/components/FeedbackSection";
import Tabs from "@/app/components/Tabs";
import type { UpsertEntryFormPersistedState } from "@/app/components/UpsertEntryForm/upsertEntryFormUtils/formValues";
import type { DbSource } from "@/db/db-source";
import type { ArtistByIdResult } from "@/types/artists";
import type { FormFeedback } from "@/types/form";
import { formFeedbackInitialValue } from "@/utils/form";

type ArtistEntriesTab = "searchEntries" | "addEntry";

type ArtistWindowMainContentProps = {
  artist: ArtistByIdResult;
  artistId: string;
  primaryDbSource: DbSource;
};

/** Stable ids for this tablist (single Artist view per document). */
const SEARCH_ENTRIES_TAB_ID = "artist-search-entries-tab";
const SEARCH_ENTRIES_PANEL_ID = "artist-search-entries-panel";
const ADD_ENTRY_TAB_ID = "artist-add-entry-tab";
const ADD_ENTRY_PANEL_ID = "artist-add-entry-panel";
const CREATE_ENTRY_NOTIFICATIONS_ID = "artist-create-entry-notifications";
const CREATE_ENTRY_ERRORS_ID = "artist-create-entry-errors";

const ArtistWindowMainContent: FC<ArtistWindowMainContentProps> = ({
  artist,
  artistId,
  primaryDbSource,
}) => {
  const [activeTab, setActiveTab] = useState<ArtistEntriesTab>("searchEntries");
  const [searchEntriesQuery, setSearchEntriesQuery] = useState("");
  const [createEntryFeedback, setCreateEntryFeedback] = useState<FormFeedback>(
    formFeedbackInitialValue,
  );
  const createEntryDraftRef = useRef<UpsertEntryFormPersistedState | null>(
    null,
  );

  useEffect(() => {
    setCreateEntryFeedback(formFeedbackInitialValue);
  }, [primaryDbSource]);

  return (
    <main>
      <ArtistInfo artist={artist} />

      <FeedbackSection
        notificationsId={CREATE_ENTRY_NOTIFICATIONS_ID}
        errorsId={CREATE_ENTRY_ERRORS_ID}
        feedback={createEntryFeedback}
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
        ]}
      />
    </main>
  );
};

export default ArtistWindowMainContent;
