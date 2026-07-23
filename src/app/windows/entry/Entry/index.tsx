import { useEffect, useMemo, useRef, useState, type FC } from "react";

import EntryArtists from "./EntryArtists";
import EntryDetailsPanel from "./EntryDetailsPanel";
import EntryReleases from "./EntryReleases";
import ReleaseForm from "./ReleaseForm";
import {
  type ReleaseFormState,
  type ReleaseFormTabSharedData,
} from "./ReleaseForm/releaseFormUtils/formValues";

import FeedbackSection from "@/app/components/FeedbackSection";
import Tabs from "@/app/components/Tabs";
import UpsertEntryForm from "@/app/components/UpsertEntryForm";
import type { UpsertEntryFormPersistedState } from "@/app/components/UpsertEntryForm/upsertEntryFormUtils/formValues";
import api from "@/app/windows/entry/api";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES } from "@/db/db-source-options";
import type { CountryListItem } from "@/types/countries";
import type { EntryByIdResult } from "@/types/entries";
import type { FormFeedback } from "@/types/form";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { ReleaseByIdResult } from "@/types/releases";
import type { TagListItem } from "@/types/tags";
import { sanitizeReleaseDate } from "@/utils/date";
import { formFeedbackInitialValue } from "@/utils/form";

type EntryProps = {
  entry: EntryByIdResult;
  primaryDbSource: DbSource;
  onEntryUpdated: (entry: EntryByIdResult) => void;
};

const readFocusedReleaseIdFromUrl = (): string | null =>
  new URLSearchParams(window.location.search).get("releaseId");

type EntryTab =
  | { id: "releases" | "editEntry"; data?: never }
  | {
      id: "releaseUpsertForm";
      data: ReleaseFormTabSharedData;
    };

type EntryTabId = EntryTab["id"];

const upsertReleaseFormTabInitialStateDate = {
  mode: "create" as const,
  dbSources: new Set(ALL_DB_SOURCES) as ReadonlySet<DbSource>,
};

const entryTabInitialState = (id: EntryTabId): EntryTab => {
  if (id === "releaseUpsertForm") {
    return {
      id,
      data: upsertReleaseFormTabInitialStateDate,
    };
  }

  return { id };
};

/** Stable ids for this tablist (single Entry view per document). */
const RELEASES_TAB_ID = "releases-tab";
const RELEASES_PANEL_ID = "releases-panel";
const ADD_RELEASE_TAB_ID = "add-release-tab";
const ADD_RELEASE_PANEL_ID = "add-release-panel";
const EDIT_ENTRY_TAB_ID = "edit-entry-tab";
const EDIT_ENTRY_PANEL_ID = "edit-entry-panel";
const EDIT_ENTRY_UPDATE_NOTIFICATIONS_ID = "edit-entry-update-notifications";
const EDIT_ENTRY_UPDATE_ERRORS_ID = "edit-entry-update-errors";

const Entry: FC<EntryProps> = ({ entry, primaryDbSource, onEntryUpdated }) => {
  const [focusedReleaseId, setFocusedReleaseId] = useState<string | null>(
    readFocusedReleaseIdFromUrl,
  );
  const isFocusedReleaseView = focusedReleaseId !== null;
  const [activeTab, setActiveTab] = useState<EntryTab>(
    entryTabInitialState("releaseUpsertForm"),
  );

  const [tags, setTags] = useState<TagListItem[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsLoadFailed, setTagsLoadFailed] = useState(false);

  const [releaseFormState, setReleaseFormState] =
    useState<ReleaseFormState | null>(null);
  const editEntryDraftRef = useRef<UpsertEntryFormPersistedState | null>(null);

  const [allFormats, setAllFormats] = useState<ReleasesFormatListItem[]>([]);
  const [labels, setLabels] = useState<LabelListItem[]>([]);
  const [addReleaseReferenceDataLoading, setAddReleaseReferenceDataLoading] =
    useState(false);
  const [
    addReleaseReferenceDataLoadFailed,
    setAddReleaseReferenceDataLoadFailed,
  ] = useState(false);
  const addReleaseReferenceDataDbSourceRef = useRef<DbSource | null>(null);
  const fetchAddReleaseReferenceDataTokenRef = useRef(0);

  const [allCountries, setAllCountries] = useState<CountryListItem[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [countriesLoadFailed, setCountriesLoadFailed] = useState(false);
  const countriesDbSourceRef = useRef<DbSource | null>(null);
  const fetchCountriesTokenRef = useRef(0);

  const [latestUpdateEntryFeedback, setLatestUpdateEntryFeedback] =
    useState<FormFeedback>(formFeedbackInitialValue);

  const [latestAddedReleaseId, setLatestAddedReleaseId] = useState<string>();
  const [
    latestCreateReleaseNotifications,
    setLatestCreateReleaseNotifications,
  ] = useState<string[]>([]);
  const [latestCreateReleaseErrors, setLatestCreateReleaseErrors] = useState<
    string[]
  >([]);
  const [latestUpdatedReleaseId, setLatestUpdatedReleaseId] =
    useState<string>();
  const [
    latestUpdateReleaseNotifications,
    setLatestUpdateReleaseNotifications,
  ] = useState<string[]>([]);
  const [latestUpdateReleaseErrors, setLatestUpdateReleaseErrors] = useState<
    string[]
  >([]);

  const activeTabId = activeTab.id;
  const releaseFormTabData = activeTab.data;
  const isReleaseFormUpdateMode = releaseFormTabData?.mode === "update";

  const handleTabChange = (tabId: EntryTabId) => {
    setActiveTab(entryTabInitialState(tabId));
  };

  const handleReleaseCreated = (
    releaseId: string | undefined,
    notifications: string[],
    errors: string[],
  ) => {
    setLatestAddedReleaseId(releaseId);
    setLatestCreateReleaseNotifications(notifications);
    setLatestCreateReleaseErrors(errors);
    handleTabChange("releases");
  };

  const handleEntryUpdated = (
    updatedEntry: EntryByIdResult,
    feedback: FormFeedback,
  ) => {
    onEntryUpdated(updatedEntry);
    setLatestUpdateEntryFeedback(feedback);
  };

  const sanitizedEntry = useMemo(
    () => ({
      ...entry,
      originalReleaseDate: sanitizeReleaseDate(entry.originalReleaseDate),
    }),
    [entry],
  );

  const handleReleaseUpdated = (
    releaseId: string,
    notifications: string[],
    errors: string[],
  ) => {
    setLatestUpdatedReleaseId(releaseId);
    setLatestUpdateReleaseNotifications(notifications);
    setLatestUpdateReleaseErrors(errors);
    handleTabChange("releases");
  };

  const handleEditRelease = (release: ReleaseByIdResult) => {
    const dbSources = releaseFormState?.dbSources.value;

    setReleaseFormState(null);
    setActiveTab({
      id: "releaseUpsertForm",
      data: {
        mode: "update",
        releaseBlueprint: release,
        dbSources,
      },
    });
  };

  const handleUseReleaseAsBlueprint = (releaseBlueprint: ReleaseByIdResult) => {
    const dbSources = releaseFormState?.dbSources.value;

    setReleaseFormState(null);
    setActiveTab({
      id: "releaseUpsertForm",
      data: {
        mode: "create",
        releaseBlueprint,
        dbSources,
      },
    });
  };

  useEffect(() => {
    setReleaseFormState(null);
    setActiveTab((tab) => entryTabInitialState(tab.id));
    setTags([]);
    setTagsLoadFailed(false);
    tagsDbSourceRef.current = null;
    setAllFormats([]);
    setLabels([]);
    setAllCountries([]);
    setCountriesLoadFailed(false);
    countriesDbSourceRef.current = null;
    setAddReleaseReferenceDataLoadFailed(false);
    addReleaseReferenceDataDbSourceRef.current = null;
    editEntryDraftRef.current = null;
  }, [entry.entryId]);

  const fetchTagsTokenRef = useRef(0);
  const tagsDbSourceRef = useRef<DbSource | null>(null);

  useEffect(() => {
    if (
      (activeTabId !== "releaseUpsertForm" && activeTabId !== "editEntry") ||
      tagsDbSourceRef.current === primaryDbSource
    ) {
      return;
    }

    const token = ++fetchTagsTokenRef.current;
    setTagsLoading(true);
    setTagsLoadFailed(false);

    api
      .fetchTags(primaryDbSource)
      .then((tagsData) => {
        if (token !== fetchTagsTokenRef.current) {
          return;
        }

        setTags(tagsData);
        tagsDbSourceRef.current = primaryDbSource;
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
  }, [activeTabId, primaryDbSource]);

  useEffect(() => {
    if (
      (activeTabId !== "releaseUpsertForm" && activeTabId !== "releases") ||
      countriesDbSourceRef.current === primaryDbSource
    ) {
      return;
    }

    const token = ++fetchCountriesTokenRef.current;
    setCountriesLoading(true);
    setCountriesLoadFailed(false);

    api
      .fetchCountries(primaryDbSource)
      .then((countriesData) => {
        if (token !== fetchCountriesTokenRef.current) {
          return;
        }

        setAllCountries(countriesData);
        countriesDbSourceRef.current = primaryDbSource;
        setCountriesLoading(false);
      })
      .catch((error: unknown) => {
        console.error("Error fetching countries", error);

        if (token !== fetchCountriesTokenRef.current) {
          return;
        }

        setCountriesLoadFailed(true);
        setCountriesLoading(false);
      });

    return () => {
      fetchCountriesTokenRef.current += 1;
    };
  }, [activeTabId, primaryDbSource]);

  useEffect(() => {
    if (
      activeTabId !== "releaseUpsertForm" ||
      addReleaseReferenceDataDbSourceRef.current === primaryDbSource
    ) {
      return;
    }

    const token = ++fetchAddReleaseReferenceDataTokenRef.current;
    setAddReleaseReferenceDataLoading(true);
    setAddReleaseReferenceDataLoadFailed(false);

    Promise.all([
      api.fetchReleasesFormats(primaryDbSource),
      api.fetchLabels(primaryDbSource),
    ])
      .then(([formatsData, labelsData]) => {
        if (token !== fetchAddReleaseReferenceDataTokenRef.current) {
          return;
        }

        setAllFormats(formatsData);
        setLabels(labelsData);
        addReleaseReferenceDataDbSourceRef.current = primaryDbSource;
      })
      .catch((error: unknown) => {
        console.error("Error fetching release formats or labels", error);

        if (token !== fetchAddReleaseReferenceDataTokenRef.current) {
          return;
        }

        setAddReleaseReferenceDataLoadFailed(true);
      })
      .finally(() => {
        if (token !== fetchAddReleaseReferenceDataTokenRef.current) {
          return;
        }

        setAddReleaseReferenceDataLoading(false);
      });

    return () => {
      fetchAddReleaseReferenceDataTokenRef.current += 1;
    };
  }, [activeTabId, primaryDbSource]);

  const handleShowFullEntryWindow = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("releaseId");
    window.history.replaceState(null, "", url.toString());
    setFocusedReleaseId(null);

    setActiveTab(entryTabInitialState("releases"));
  };

  const entryReleasesPanel = (
    <EntryReleases
      entry={entry}
      primaryDbSource={primaryDbSource}
      allCountries={allCountries}
      countriesLoading={countriesLoading}
      countriesLoadFailed={countriesLoadFailed}
      focusedReleaseId={focusedReleaseId}
      onShowFullEntryWindow={handleShowFullEntryWindow}
      latestAddedReleaseId={latestAddedReleaseId}
      latestUpdatedReleaseId={latestUpdatedReleaseId}
      latestCreateNotifications={latestCreateReleaseNotifications}
      latestCreatedErrors={latestCreateReleaseErrors}
      latestUpdateNotifications={latestUpdateReleaseNotifications}
      latestUpdatedErrors={latestUpdateReleaseErrors}
      onUseReleaseAsBlueprint={handleUseReleaseAsBlueprint}
      onEditRelease={handleEditRelease}
      onDismissCreateNotifications={() =>
        setLatestCreateReleaseNotifications([])
      }
      onDismissCreatedErrors={() => setLatestCreateReleaseErrors([])}
      onDismissUpdateNotifications={() =>
        setLatestUpdateReleaseNotifications([])
      }
      onDismissUpdatedErrors={() => setLatestUpdateReleaseErrors([])}
    />
  );

  return (
    <div>
      <h1>{entry.mainName}</h1>

      <EntryArtists artists={entry.artists} />
      <EntryDetailsPanel entry={entry} />

      {isFocusedReleaseView ? (
        entryReleasesPanel
      ) : (
        <Tabs
          ariaLabel="Releases, add release, and edit entry"
          activeTab={activeTabId}
          onTabChange={handleTabChange}
          tabs={[
            {
              id: "releases",
              tabId: RELEASES_TAB_ID,
              panelId: RELEASES_PANEL_ID,
              label: "Releases in collection",
              children: entryReleasesPanel,
            },
            {
              id: "releaseUpsertForm",
              tabId: ADD_RELEASE_TAB_ID,
              panelId: ADD_RELEASE_PANEL_ID,
              label: isReleaseFormUpdateMode
                ? "Edit release"
                : "Add new release",
              children: (
                <ReleaseForm
                  entry={sanitizedEntry}
                  primaryDbSource={primaryDbSource}
                  tags={tags}
                  allFormats={allFormats}
                  labels={labels}
                  allCountries={allCountries}
                  referenceDataLoading={
                    addReleaseReferenceDataLoading ||
                    tagsLoading ||
                    countriesLoading
                  }
                  referenceDataLoadFailed={
                    addReleaseReferenceDataLoadFailed ||
                    tagsLoadFailed ||
                    countriesLoadFailed
                  }
                  formState={releaseFormState}
                  onFormStateChange={setReleaseFormState}
                  tabData={
                    isReleaseFormUpdateMode
                      ? {
                          ...releaseFormTabData,
                          onReleaseUpdated: handleReleaseUpdated,
                        }
                      : {
                          ...(releaseFormTabData ??
                            upsertReleaseFormTabInitialStateDate),
                          onReleaseCreated: handleReleaseCreated,
                        }
                  }
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
                  <FeedbackSection
                    notificationsId={EDIT_ENTRY_UPDATE_NOTIFICATIONS_ID}
                    errorsId={EDIT_ENTRY_UPDATE_ERRORS_ID}
                    notifications={latestUpdateEntryFeedback.notifications}
                    errors={latestUpdateEntryFeedback.errors}
                  />
                  <UpsertEntryForm
                    mode="update"
                    entry={sanitizedEntry}
                    primaryDbSource={primaryDbSource}
                    tags={tags}
                    api={{
                      fetchEntryTypes: api.fetchEntryTypes,
                      getEntryReleaseTagIds: api.getEntryReleaseTagIds,
                      updateMusicalEntry: api.updateMusicalEntry,
                    }}
                    tagsLoading={tagsLoading}
                    tagsLoadFailed={tagsLoadFailed}
                    restoredState={editEntryDraftRef.current}
                    onPersistState={(state) => {
                      editEntryDraftRef.current = state;
                    }}
                    onCancel={() => handleTabChange("releases")}
                    onEntrySaved={handleEntryUpdated}
                  />
                </>
              ),
            },
          ]}
        />
      )}
    </div>
  );
};

export default Entry;
