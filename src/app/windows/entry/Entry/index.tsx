import { useEffect, useMemo, useRef, useState, type FC } from "react";

import AddReleaseForm from "./AddReleaseForm";
import EditEntryForm from "./EditEntryForm";
import styles from "./Entry.module.css";
import EntryArtists from "./EntryArtists";
import EntryDetailsPanel from "./EntryDetailsPanel";
import EntryReleases from "./EntryReleases";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
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

      <section
        className={styles.tabs}
        aria-label="Releases, add release, and edit entry"
      >
        <div className={styles.tabList} role="tablist">
          <button
            type="button"
            id={RELEASES_TAB_ID}
            role="tab"
            aria-selected={activeTab === "releases"}
            aria-controls={RELEASES_PANEL_ID}
            className={
              activeTab === "releases"
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
            onClick={() => setActiveTab("releases")}
          >
            Releases in collection
          </button>
          <button
            type="button"
            id={ADD_RELEASE_TAB_ID}
            role="tab"
            aria-selected={activeTab === "addRelease"}
            aria-controls={ADD_RELEASE_PANEL_ID}
            className={
              activeTab === "addRelease"
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
            onClick={() => setActiveTab("addRelease")}
          >
            Add new release
          </button>
          <button
            type="button"
            id={EDIT_ENTRY_TAB_ID}
            role="tab"
            aria-selected={activeTab === "editEntry"}
            aria-controls={EDIT_ENTRY_PANEL_ID}
            className={
              activeTab === "editEntry"
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
            onClick={() => setActiveTab("editEntry")}
          >
            Edit entry
          </button>
        </div>

        <div
          id={RELEASES_PANEL_ID}
          role="tabpanel"
          aria-labelledby={RELEASES_TAB_ID}
          hidden={activeTab !== "releases"}
          className={styles.tabPanel}
        >
          <EntryReleases
            entry={entry}
            dbSource={dbSource}
            isActive={activeTab === "releases"}
            latestAddedReleaseId={latestAddedReleaseId}
            latestCreateNotifications={latestCreateReleaseNotifications}
            latestCreatedErrors={latestCreateReleaseErrors}
            onDismissCreateNotifications={() =>
              setLatestCreateReleaseNotifications([])
            }
            onDismissCreatedErrors={() => setLatestCreateReleaseErrors([])}
          />
        </div>

        <div
          id={ADD_RELEASE_PANEL_ID}
          role="tabpanel"
          aria-labelledby={ADD_RELEASE_TAB_ID}
          hidden={activeTab !== "addRelease"}
          className={styles.tabPanel}
        >
          <AddReleaseForm
            entry={sanitizedEntry}
            dbSource={dbSource}
            tags={tags}
            tagsLoading={tagsLoading}
            tagsLoadFailed={tagsLoadFailed}
            onCancel={() => setActiveTab("releases")}
            onReleaseCreated={handleReleaseCreated}
          />
        </div>

        <div
          id={EDIT_ENTRY_PANEL_ID}
          role="tabpanel"
          aria-labelledby={EDIT_ENTRY_TAB_ID}
          hidden={activeTab !== "editEntry"}
          className={styles.tabPanel}
        >
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
            onCancel={() => setActiveTab("releases")}
            onEntryUpdated={handleEntryUpdated}
          />
        </div>
      </section>
    </div>
  );
};

export default Entry;
