import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";

import AddReleaseForm from "./AddReleaseForm";
import type { AddReleaseFormPersistedState } from "./AddReleaseForm/addReleaseFormUtils/formValues";
import EditEntryForm from "./EditEntryForm";
import type { EditEntryFormPersistedState } from "./EditEntryForm/editEntryFormUtils/formValues";
import EntryArtists from "./EntryArtists";
import EntryDetailsPanel from "./EntryDetailsPanel";
import EntryReleases from "./EntryReleases";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import Tabs from "@/app/components/Tabs";
import api from "@/app/windows/entry/api";
import type { DbSource } from "@/db/db-source";
import type { EntryByIdResult } from "@/types/entries";
import type { TagListItem } from "@/types/tags";
import { sanitizeReleaseDate } from "@/utils/date";

type EntryProps = {
  entry: EntryByIdResult;
  dbSource: DbSource;
  onEntryUpdated: (entry: EntryByIdResult) => void;
};

type EntryTab = "releases" | "addRelease" | "editEntry";

/** Stable ids for this tablist (single Entry view per document). */
const RELEASES_TAB_ID = "releases-tab";
const RELEASES_PANEL_ID = "releases-panel";
const ADD_RELEASE_TAB_ID = "add-release-tab";
const ADD_RELEASE_PANEL_ID = "add-release-panel";
const EDIT_ENTRY_TAB_ID = "edit-entry-tab";
const EDIT_ENTRY_PANEL_ID = "edit-entry-panel";
const EDIT_ENTRY_UPDATE_NOTIFICATIONS_ID = "edit-entry-update-notifications";
const EDIT_ENTRY_UPDATE_ERRORS_ID = "edit-entry-update-errors";

const Entry: FC<EntryProps> = ({ entry, dbSource, onEntryUpdated }) => {
  const [activeTab, setActiveTab] = useState<EntryTab>("addRelease");
  const tagsShouldBeFetched =
    activeTab === "addRelease" || activeTab === "editEntry";

  const [tags, setTags] = useState<TagListItem[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsLoadFailed, setTagsLoadFailed] = useState(false);
  const fetchTagsTokenRef = useRef(0);
  const addReleaseDraftRef = useRef<AddReleaseFormPersistedState | null>(null);
  const editEntryDraftRef = useRef<EditEntryFormPersistedState | null>(null);

  const persistAddReleaseDraft = useCallback(
    (state: AddReleaseFormPersistedState) => {
      addReleaseDraftRef.current = state;
    },
    [],
  );

  const persistEditEntryDraft = useCallback(
    (state: EditEntryFormPersistedState) => {
      editEntryDraftRef.current = state;
    },
    [],
  );

  const [latestUpdateEntryNotifications, setLatestUpdateEntryNotifications] =
    useState<string[]>([]);
  const [latestUpdateEntryErrors, setLatestUpdateEntryErrors] = useState<
    string[]
  >([]);

  const [latestAddedReleaseId, setLatestAddedReleaseId] = useState<string>();
  const [
    latestCreateReleaseNotifications,
    setLatestCreateReleaseNotifications,
  ] = useState<string[]>([]);
  const [latestCreateReleaseErrors, setLatestCreateReleaseErrors] = useState<
    string[]
  >([]);

  const handleReleaseCreated = (
    releaseId: string | undefined,
    notifications: string[],
    errors: string[],
  ) => {
    setLatestAddedReleaseId(releaseId);
    setLatestCreateReleaseNotifications(notifications);
    setLatestCreateReleaseErrors(errors);
    setActiveTab("releases");
  };

  const handleEntryUpdated = (
    updatedEntry: EntryByIdResult,
    notifications: string[],
    errors: string[],
  ) => {
    onEntryUpdated(updatedEntry);
    setLatestUpdateEntryNotifications(notifications);
    setLatestUpdateEntryErrors(errors);
  };

  const updateEntryNotifications = latestUpdateEntryNotifications.map(
    (notification) => ({
      notification,
    }),
  );

  const updateEntryErrors = latestUpdateEntryErrors.map((message) => ({
    message,
  }));

  const sanitizedEntry = useMemo(
    () => ({
      ...entry,
      originalReleaseDate: sanitizeReleaseDate(entry.originalReleaseDate),
    }),
    [entry],
  );

  useEffect(() => {
    addReleaseDraftRef.current = null;
    editEntryDraftRef.current = null;
  }, [entry.entryId]);

  useEffect(() => {
    if (!tagsShouldBeFetched) {
      return;
    }

    const token = ++fetchTagsTokenRef.current;
    setTagsLoading(true);
    setTagsLoadFailed(false);

    api
      .fetchTags(dbSource)
      .then((tagsData) => {
        if (token !== fetchTagsTokenRef.current) {
          return;
        }

        setTags(tagsData);
        setTagsLoading(false);
      })
      .catch((error: unknown) => {
        console.error("Error fetching tags", error);

        if (token !== fetchTagsTokenRef.current) {
          return;
        }

        setTagsLoadFailed(true);
        setTagsLoading(false);
      });

    return () => {
      fetchTagsTokenRef.current += 1;
    };

    // Re-fetch when entry changes so tag pickers stay in sync after updates.
  }, [tagsShouldBeFetched, dbSource, entry]);

  return (
    <div>
      <h1>{entry.mainName}</h1>

      <EntryArtists artists={entry.artists} />
      <EntryDetailsPanel entry={entry} />

      <Tabs
        ariaLabel="Releases, add release, and edit entry"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: "releases",
            tabId: RELEASES_TAB_ID,
            panelId: RELEASES_PANEL_ID,
            label: "Releases in collection",
            children: (
              <EntryReleases
                entry={entry}
                dbSource={dbSource}
                latestAddedReleaseId={latestAddedReleaseId}
                latestCreateNotifications={latestCreateReleaseNotifications}
                latestCreatedErrors={latestCreateReleaseErrors}
                onDismissCreateNotifications={() =>
                  setLatestCreateReleaseNotifications([])
                }
                onDismissCreatedErrors={() => setLatestCreateReleaseErrors([])}
              />
            ),
          },
          {
            id: "addRelease",
            tabId: ADD_RELEASE_TAB_ID,
            panelId: ADD_RELEASE_PANEL_ID,
            label: "Add new release",
            children: (
              <AddReleaseForm
                entry={sanitizedEntry}
                dbSource={dbSource}
                tags={tags}
                tagsLoading={tagsLoading}
                tagsLoadFailed={tagsLoadFailed}
                restoredState={addReleaseDraftRef.current}
                onPersistState={persistAddReleaseDraft}
                onCancel={() => setActiveTab("releases")}
                onReleaseCreated={handleReleaseCreated}
              />
            ),
          },
          {
            id: "editEntry",
            tabId: EDIT_ENTRY_TAB_ID,
            panelId: EDIT_ENTRY_PANEL_ID,
            label: "Edit entry",
            children: (
              <>
                <FormFieldNotifications
                  id={EDIT_ENTRY_UPDATE_NOTIFICATIONS_ID}
                  messages={updateEntryNotifications}
                />
                <FormFieldErrorMessages
                  id={EDIT_ENTRY_UPDATE_ERRORS_ID}
                  messages={updateEntryErrors}
                />
                <EditEntryForm
                  entry={sanitizedEntry}
                  dbSource={dbSource}
                  tags={tags}
                  tagsLoading={tagsLoading}
                  tagsLoadFailed={tagsLoadFailed}
                  restoredState={editEntryDraftRef.current}
                  onPersistState={persistEditEntryDraft}
                  onCancel={() => setActiveTab("releases")}
                  onEntryUpdated={handleEntryUpdated}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Entry;
