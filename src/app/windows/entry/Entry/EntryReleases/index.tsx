import { useCallback, useEffect, useRef, useState, type FC } from "react";

import EntryReleasesList from "./EntryReleasesList";

import api from "../../api";

import ErrorMessages from "@/app/components/ErrorMessages";
import NotificationMessages from "@/app/components/NotificationMessages";
import type { DbSource } from "@/db/db-source";
import type { CountryListItem } from "@/types/countries";
import type { EntryByIdResult } from "@/types/entries";
import type { EntryRelease, ReleaseByIdResult } from "@/types/releases";

type EntryReleasesProps = {
  entry: EntryByIdResult;
  primaryDbSource: DbSource;
  allCountries: CountryListItem[];
  countriesLoading: boolean;
  countriesLoadFailed: boolean;
  focusedReleaseId: string | null;
  onShowFullEntryWindow: () => void;
  latestAddedReleaseId: string | undefined;
  latestUpdatedReleaseId: string | undefined;
  latestCreateNotifications: string[];
  latestCreatedErrors: string[];
  latestUpdateNotifications: string[];
  latestUpdatedErrors: string[];
  onUseReleaseAsBlueprint: (releaseBlueprint: ReleaseByIdResult) => void;
  onEditRelease: (release: ReleaseByIdResult) => void;
  onDismissCreateNotifications: () => void;
  onDismissCreatedErrors: () => void;
  onDismissUpdateNotifications: () => void;
  onDismissUpdatedErrors: () => void;
};

const CREATE_NOTIFICATIONS_ID = "entry-releases-create-notifications";
const CREATE_ERRORS_ID = "entry-releases-create-errors";
const UPDATE_NOTIFICATIONS_ID = "entry-releases-update-notifications";
const UPDATE_ERRORS_ID = "entry-releases-update-errors";
const DELETE_ERRORS_ID = "entry-releases-delete-errors";

const panelClassName = "mt-3 max-w-[42rem]";
const fieldClassName = "m-0 text-[0.95em]";
const sectionTitleClassName = "m-0 mb-3";
const emptyStateClassName = "text-xl font-bold";
const createNotificationClassName =
  "mb-3 flex items-start justify-between gap-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2";
const createNotificationDismissClassName =
  "m-0 shrink-0 cursor-pointer rounded border border-emerald-300 bg-transparent px-[0.55rem] py-[0.2rem] text-[0.85em] font-medium text-green-950 transition-[background,color,border-color] duration-150 hover:border-green-950 hover:bg-green-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-950";
const createErrorClassName =
  "mb-3 flex items-start justify-between gap-3 rounded-md border border-red-300 bg-red-50 px-3 py-2";
const createErrorDismissClassName =
  "m-0 shrink-0 cursor-pointer rounded border border-red-300 bg-transparent px-[0.55rem] py-[0.2rem] text-[0.85em] font-medium text-red-800 transition-[background,color,border-color] duration-150 hover:border-red-800 hover:bg-red-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800";
const deletedNotificationClassName =
  "mt-3 flex items-center justify-between gap-3 rounded-md border border-emerald-300 bg-emerald-100 px-3 py-2 text-[0.92rem] text-green-950";
const deletedNotificationTextClassName = "min-w-0 flex-1";
const deletedNotificationDismissClassName = createNotificationDismissClassName;
const focusedReleaseCtaClassName = "mb-6 text-[0.92rem] text-[#444]";
const focusedReleaseCtaButtonClassName =
  "m-0 cursor-pointer border-none bg-transparent p-0 text-inherit text-[#1a5fb4] underline hover:text-[#0d3d82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a5fb4]";

const EntryReleases: FC<EntryReleasesProps> = ({
  entry,
  primaryDbSource,
  allCountries,
  countriesLoading,
  countriesLoadFailed,
  focusedReleaseId,
  onShowFullEntryWindow,
  latestAddedReleaseId,
  latestUpdatedReleaseId,
  latestCreateNotifications,
  latestCreatedErrors,
  latestUpdateNotifications,
  latestUpdatedErrors,
  onUseReleaseAsBlueprint,
  onEditRelease,
  onDismissCreateNotifications,
  onDismissCreatedErrors,
  onDismissUpdateNotifications,
  onDismissUpdatedErrors,
}) => {
  const isFocusedReleaseView = focusedReleaseId !== null;

  const [releases, setReleases] = useState<EntryRelease[]>();
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [recentlyDeletedVersion, setRecentlyDeletedVersion] =
    useState<string>();
  const [latestDeletedErrors, setLatestDeletedErrors] = useState<string[]>([]);

  // Token bumped on every fetch / unmount; in-flight responses with a stale
  // token are discarded so we never setState on stale data or after unmount.
  const fetchTokenRef = useRef(0);

  const fetchReleases = useCallback(() => {
    setLoadFailed(false);
    setReleases(undefined);

    // Focused mode has no entry-wide list to fetch: the selected release loads
    // its own details (and header) inside the list.
    if (focusedReleaseId !== null) {
      setLoading(false);

      return;
    }

    const token = ++fetchTokenRef.current;
    setLoading(true);

    api
      .getEntryReleases(entry.entryId, primaryDbSource)
      .then((data) => {
        if (token !== fetchTokenRef.current) {
          return;
        }

        setReleases(data);
        setLoading(false);
      })
      .catch((error: unknown) => {
        console.error("Error getting entry releases", error);

        if (token !== fetchTokenRef.current) {
          return;
        }

        setLoadFailed(true);
        setReleases([]);
        setLoading(false);
      });
  }, [entry.entryId, primaryDbSource, focusedReleaseId]);

  // Fetches on mount; remounting (e.g. after visiting "Add release") loads a fresh list.
  useEffect(() => {
    fetchReleases();

    return () => {
      // Invalidate the in-flight fetch (if any) so its setState is skipped.
      fetchTokenRef.current += 1;
    };
  }, [fetchReleases]);

  const handleReleaseDeleted = (
    deletedReleaseVersion: string,
    errors: string[],
  ) => {
    setRecentlyDeletedVersion(deletedReleaseVersion);
    setLatestDeletedErrors(errors);
    fetchReleases();
  };

  const dismissDeletedNotification = () => {
    setRecentlyDeletedVersion(undefined);
  };

  const dismissDeletedErrors = () => {
    setLatestDeletedErrors([]);
  };

  if (loading || countriesLoading) {
    return <p className={emptyStateClassName}>Loading releases&hellip;</p>;
  }

  if (loadFailed || countriesLoadFailed) {
    return (
      <p className={emptyStateClassName}>
        Could not load releases or related data.
      </p>
    );
  }

  const visibleReleases = releases ?? [];

  const createNotifications = latestCreateNotifications.map((notification) => ({
    notification,
  }));

  const createNotificationBanner = createNotifications.length > 0 && (
    <div className={createNotificationClassName} role="status">
      <NotificationMessages
        id={CREATE_NOTIFICATIONS_ID}
        messages={createNotifications}
      />
      <button
        type="button"
        className={createNotificationDismissClassName}
        onClick={onDismissCreateNotifications}
        aria-label="Dismiss notifications"
      >
        Dismiss
      </button>
    </div>
  );

  const createErrors = latestCreatedErrors.map((message) => ({ message }));

  const createErrorBanner = createErrors.length > 0 && (
    <div className={createErrorClassName}>
      <ErrorMessages id={CREATE_ERRORS_ID} messages={createErrors} />
      <button
        type="button"
        className={createErrorDismissClassName}
        onClick={onDismissCreatedErrors}
        aria-label="Dismiss errors"
      >
        Dismiss
      </button>
    </div>
  );

  const updateNotifications = latestUpdateNotifications.map((notification) => ({
    notification,
  }));

  const updateNotificationBanner = updateNotifications.length > 0 && (
    <div className={createNotificationClassName} role="status">
      <NotificationMessages
        id={UPDATE_NOTIFICATIONS_ID}
        messages={updateNotifications}
      />
      <button
        type="button"
        className={createNotificationDismissClassName}
        onClick={onDismissUpdateNotifications}
        aria-label="Dismiss update notifications"
      >
        Dismiss
      </button>
    </div>
  );

  const updateErrors = latestUpdatedErrors.map((message) => ({ message }));

  const updateErrorBanner = updateErrors.length > 0 && (
    <div className={createErrorClassName}>
      <ErrorMessages id={UPDATE_ERRORS_ID} messages={updateErrors} />
      <button
        type="button"
        className={createErrorDismissClassName}
        onClick={onDismissUpdatedErrors}
        aria-label="Dismiss update errors"
      >
        Dismiss
      </button>
    </div>
  );

  const deleteErrors = latestDeletedErrors.map((message) => ({ message }));

  const deleteErrorBanner = deleteErrors.length > 0 && (
    <div className={createErrorClassName}>
      <ErrorMessages id={DELETE_ERRORS_ID} messages={deleteErrors} />
      <button
        type="button"
        className={createErrorDismissClassName}
        onClick={dismissDeletedErrors}
        aria-label="Dismiss delete errors"
      >
        Dismiss
      </button>
    </div>
  );

  const deletedNotification = !!recentlyDeletedVersion &&
    latestDeletedErrors.length === 0 && (
      <div className={deletedNotificationClassName} role="status">
        <span className={deletedNotificationTextClassName}>
          Release &quot;{recentlyDeletedVersion}&quot; was deleted successfully.
        </span>
        <button
          type="button"
          className={deletedNotificationDismissClassName}
          onClick={dismissDeletedNotification}
          aria-label="Dismiss notification"
        >
          Dismiss
        </button>
      </div>
    );

  if (!isFocusedReleaseView && (!releases || releases.length === 0)) {
    return (
      <>
        <p className={emptyStateClassName}>
          This entry has no releases in collection
        </p>
        {createErrorBanner}
        {createNotificationBanner}
        {updateErrorBanner}
        {updateNotificationBanner}
        {deleteErrorBanner}
        {deletedNotification}
      </>
    );
  }

  return (
    <div className={panelClassName}>
      {createErrorBanner}
      {createNotificationBanner}
      {updateErrorBanner}
      {updateNotificationBanner}
      {deleteErrorBanner}
      {isFocusedReleaseView ? (
        <div className={focusedReleaseCtaClassName}>
          <p className="mb-2 text-xl font-bold">
            Note! Showing only selected release&apos;s details.
          </p>
          <button
            type="button"
            className={focusedReleaseCtaButtonClassName}
            onClick={onShowFullEntryWindow}
          >
            Click here to see full entry&apos;s window content
          </button>
        </div>
      ) : (
        <h2 className={sectionTitleClassName}>Releases in collection: </h2>
      )}
      <div className={fieldClassName}>
        <EntryReleasesList
          entry={entry}
          primaryDbSource={primaryDbSource}
          releases={visibleReleases}
          allCountries={allCountries}
          focusedReleaseId={focusedReleaseId}
          showReleaseActions={!isFocusedReleaseView}
          latestAddedReleaseId={latestAddedReleaseId}
          latestUpdatedReleaseId={latestUpdatedReleaseId}
          onUseReleaseAsBlueprint={onUseReleaseAsBlueprint}
          onEditRelease={onEditRelease}
          onReleaseDeleted={handleReleaseDeleted}
        />
      </div>
      {deletedNotification}
    </div>
  );
};

export default EntryReleases;
