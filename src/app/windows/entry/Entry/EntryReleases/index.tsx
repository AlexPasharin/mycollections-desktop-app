import { useCallback, useEffect, useRef, useState, type FC } from "react";

import styles from "./EntryReleases.module.css";
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

const EntryReleases: FC<EntryReleasesProps> = ({
  entry,
  primaryDbSource,
  allCountries,
  countriesLoading,
  countriesLoadFailed,
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
    const token = ++fetchTokenRef.current;
    setLoading(true);
    setLoadFailed(false);
    setReleases(undefined);

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
  }, [entry.entryId, primaryDbSource]);

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
    return <p className={styles.emptyState}>Loading releases&hellip;</p>;
  }

  if (loadFailed || countriesLoadFailed) {
    return (
      <p className={styles.emptyState}>
        Could not load releases or related data.
      </p>
    );
  }

  const createNotifications = latestCreateNotifications.map((notification) => ({
    notification,
  }));

  const createNotificationBanner = createNotifications.length > 0 && (
    <div className={styles.createNotification} role="status">
      <NotificationMessages
        id={CREATE_NOTIFICATIONS_ID}
        messages={createNotifications}
      />
      <button
        type="button"
        className={styles.createNotificationDismiss}
        onClick={onDismissCreateNotifications}
        aria-label="Dismiss notifications"
      >
        Dismiss
      </button>
    </div>
  );

  const createErrors = latestCreatedErrors.map((message) => ({ message }));

  const createErrorBanner = createErrors.length > 0 && (
    <div className={styles.createError}>
      <ErrorMessages id={CREATE_ERRORS_ID} messages={createErrors} />
      <button
        type="button"
        className={styles.createErrorDismiss}
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
    <div className={styles.createNotification} role="status">
      <NotificationMessages
        id={UPDATE_NOTIFICATIONS_ID}
        messages={updateNotifications}
      />
      <button
        type="button"
        className={styles.createNotificationDismiss}
        onClick={onDismissUpdateNotifications}
        aria-label="Dismiss update notifications"
      >
        Dismiss
      </button>
    </div>
  );

  const updateErrors = latestUpdatedErrors.map((message) => ({ message }));

  const updateErrorBanner = updateErrors.length > 0 && (
    <div className={styles.createError}>
      <ErrorMessages id={UPDATE_ERRORS_ID} messages={updateErrors} />
      <button
        type="button"
        className={styles.createErrorDismiss}
        onClick={onDismissUpdatedErrors}
        aria-label="Dismiss update errors"
      >
        Dismiss
      </button>
    </div>
  );

  const deleteErrors = latestDeletedErrors.map((message) => ({ message }));

  const deleteErrorBanner = deleteErrors.length > 0 && (
    <div className={styles.createError}>
      <ErrorMessages id={DELETE_ERRORS_ID} messages={deleteErrors} />
      <button
        type="button"
        className={styles.createErrorDismiss}
        onClick={dismissDeletedErrors}
        aria-label="Dismiss delete errors"
      >
        Dismiss
      </button>
    </div>
  );

  const deletedNotification = !!recentlyDeletedVersion &&
    latestDeletedErrors.length === 0 && (
      <div className={styles.deletedNotification} role="status">
        <span className={styles.deletedNotificationText}>
          Release &quot;{recentlyDeletedVersion}&quot; was deleted successfully.
        </span>
        <button
          type="button"
          className={styles.deletedNotificationDismiss}
          onClick={dismissDeletedNotification}
          aria-label="Dismiss notification"
        >
          Dismiss
        </button>
      </div>
    );

  if (!releases || releases.length === 0) {
    return (
      <>
        <p className={styles.emptyState}>
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
    <div className={styles.panel}>
      {createErrorBanner}
      {createNotificationBanner}
      {updateErrorBanner}
      {updateNotificationBanner}
      {deleteErrorBanner}
      <h2 className={styles.sectionTitle}>Releases in collection: </h2>
      <div className={styles.field}>
        <EntryReleasesList
          entry={entry}
          primaryDbSource={primaryDbSource}
          releases={releases}
          allCountries={allCountries}
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
