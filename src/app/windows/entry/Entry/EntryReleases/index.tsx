import { useCallback, useEffect, useRef, useState, type FC } from "react";

import styles from "./EntryReleases.module.css";
import EntryReleasesList from "./EntryReleasesList";

import api from "../../api";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import type { DbSource } from "@/db/db-source";
import type { EntryByIdResult } from "@/types/entries";
import type { EntryRelease } from "@/types/releases";

type EntryReleasesProps = {
  entry: EntryByIdResult;
  dbSource: DbSource;
  isActive: boolean;
  latestAddedReleaseId: string | undefined;
  latestCreateNotifications: string[];
  latestCreatedErrors: string[];
  onDismissCreateNotifications: () => void;
  onDismissCreatedErrors: () => void;
};

const CREATE_NOTIFICATIONS_ID = "entry-releases-create-notifications";
const CREATE_ERRORS_ID = "entry-releases-create-errors";
const DELETE_ERRORS_ID = "entry-releases-delete-errors";

const EntryReleases: FC<EntryReleasesProps> = ({
  entry,
  dbSource,
  isActive,
  latestAddedReleaseId,
  latestCreateNotifications,
  latestCreatedErrors,
  onDismissCreateNotifications,
  onDismissCreatedErrors,
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
      .getEntryReleases(entry.entryId, dbSource)
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
  }, [entry.entryId, dbSource]);

  // Re-fetch every time this tab becomes active, so the list is always fresh
  // after the user has been on the "Add release" tab (including right after a
  // successful submission, which switches `activeTab` back to "releases").
  useEffect(() => {
    if (!isActive) {
      return;
    }

    fetchReleases();

    return () => {
      // Invalidate the in-flight fetch (if any) so its setState is skipped.
      fetchTokenRef.current += 1;
    };
  }, [isActive, fetchReleases]);

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

  if (loading) {
    return <p className={styles.emptyState}>Loading releases&hellip;</p>;
  }

  if (loadFailed) {
    return <p className={styles.emptyState}>Could not load releases.</p>;
  }

  const createNotifications = latestCreateNotifications.map((notification) => ({
    notification,
  }));

  const createNotificationBanner = createNotifications.length > 0 && (
    <div className={styles.createNotification} role="status">
      <FormFieldNotifications
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
      <FormFieldErrorMessages id={CREATE_ERRORS_ID} messages={createErrors} />
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

  const deleteErrors = latestDeletedErrors.map((message) => ({ message }));

  const deleteErrorBanner = deleteErrors.length > 0 && (
    <div className={styles.createError}>
      <FormFieldErrorMessages id={DELETE_ERRORS_ID} messages={deleteErrors} />
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

  const deletedNotification = !!recentlyDeletedVersion && latestDeletedErrors.length === 0 && (
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
        {deleteErrorBanner}
        {deletedNotification}
      </>
    );
  }

  return (
    <div className={styles.panel}>
      {createErrorBanner}
      {createNotificationBanner}
      {deleteErrorBanner}
      <h2 className={styles.sectionTitle}>Releases in collection: </h2>
      <div className={styles.field}>
        <EntryReleasesList
          entry={entry}
          dbSource={dbSource}
          releases={releases}
          latestAddedReleaseId={latestAddedReleaseId}
          onReleaseDeleted={handleReleaseDeleted}
        />
      </div>
      {deletedNotification}
    </div>
  );
};

export default EntryReleases;
