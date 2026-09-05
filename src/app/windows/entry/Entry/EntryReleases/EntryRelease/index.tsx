import { useEffect, useState, type FC } from "react";

import api from "../../../api";
import ReleaseDetails from "../ReleaseDetails";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES, dbSourceLabel } from "@/db/db-source-options";
import type { CountryListItem } from "@/types/countries";
import type { EntryByIdResult } from "@/types/entries";
import type {
  DeleteReleaseResult,
  EntryRelease as EntryReleaseRow,
  ReleaseByIdResult,
} from "@/types/releases";

type DetailsStatus = "idle" | "loading" | "loaded" | "notFound" | "failed";

type EntryReleaseProps = {
  entry: EntryByIdResult;
  primaryDbSource: DbSource;
  releaseId: string;

  /**
   * Collapsed-row header data. Optional: when absent (focused mode) the header
   * is derived from the loaded details.
   */
  releaseSummary: EntryReleaseRow | undefined;
  allCountries: CountryListItem[];
  defaultExpanded: boolean;
  isRecentlyAdded: boolean;
  isRecentlyEdited: boolean;
  showReleaseActions: boolean;
  onUseAsBlueprint: (releaseBlueprint: ReleaseByIdResult) => void;
  onEdit: (release: ReleaseByIdResult) => void;
  onDeleted: (deletedReleaseVersion: string, errors: string[]) => void;
};

const entryReleaseClassName =
  "overflow-hidden rounded-md border border-[#c7c3e8] bg-[#fafaff] text-[1.02rem]";
const releaseRowClassName = "flex w-full items-stretch";
const releaseToggleClassName =
  "m-0 flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 border-none bg-transparent px-3 py-[0.55rem] text-left [font:inherit] text-inherit hover:bg-[#f0eeff] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500";
const releaseRemoveClassName =
  "m-0 shrink-0 cursor-pointer border-none border-l border-[#e0dcf5] bg-transparent px-[0.85rem] py-0 [font:inherit] text-[0.85em] font-medium text-red-700 transition-[background,color] duration-150 hover:bg-red-600 hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-red-600";
const releaseRowMainClassName = "min-w-0 flex-1";
const releaseVersionClassName = "font-medium text-indigo-800";
const recentlyAddedBadgeClassName =
  "ml-2 inline-block rounded-full border border-emerald-300 bg-emerald-100 px-[0.45rem] py-[0.05rem] align-middle text-[0.75em] font-semibold leading-[1.35] text-green-900";
const recentlyEditedBadgeClassName =
  "ml-2 inline-block rounded-full border border-blue-300 bg-blue-100 px-[0.45rem] py-[0.05rem] align-middle text-[0.75em] font-semibold leading-[1.35] text-blue-900";
const chevronClassName =
  "relative h-5 w-5 shrink-0 after:absolute after:inset-0 after:m-auto after:h-[0.45rem] after:w-[0.45rem] after:-rotate-45 after:border-r-2 after:border-b-2 after:border-indigo-600 after:transition-transform after:duration-[220ms] after:ease-[ease] after:content-['']";
const chevronExpandedClassName =
  "relative h-5 w-5 shrink-0 after:absolute after:inset-0 after:m-auto after:h-[0.45rem] after:w-[0.45rem] after:rotate-45 after:border-r-2 after:border-b-2 after:border-indigo-600 after:transition-transform after:duration-[220ms] after:ease-[ease] after:content-['']";
const detailsSlideClassName =
  "grid grid-rows-[0fr] transition-[grid-template-rows] duration-[320ms] ease-[ease]";
const detailsSlideOpenClassName =
  "grid grid-rows-[1fr] transition-[grid-template-rows] duration-[320ms] ease-[ease]";
const detailsSlideInnerClassName = "min-h-0 overflow-hidden";
const releaseDetailsPanelClassName =
  "border-t border-[#e0dcf5] bg-white px-3 pb-3";
const detailsLoadingClassName = "m-0 mt-[0.65rem] text-[0.92em] text-gray-600";
const detailsMissingClassName = "m-0 mt-[0.65rem] text-[0.92em] text-amber-700";

const EntryRelease: FC<EntryReleaseProps> = ({
  entry,
  primaryDbSource,
  releaseId,
  releaseSummary,
  allCountries,
  defaultExpanded,
  isRecentlyAdded,
  isRecentlyEdited,
  showReleaseActions,
  onUseAsBlueprint,
  onEdit,
  onDeleted,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [details, setDetails] = useState<ReleaseByIdResult>();
  const [detailsStatus, setDetailsStatus] = useState<DetailsStatus>("idle");

  // Load (and reload) details whenever this release is expanded; the cleanup
  // flag discards stale responses on collapse, db-source change, or unmount.
  useEffect(() => {
    if (!isExpanded) {
      setDetails(undefined);
      setDetailsStatus("idle");

      return;
    }

    let ignore = false;
    setDetails(undefined);
    setDetailsStatus("loading");

    api
      .getReleaseById(releaseId, primaryDbSource)
      .then((row) => {
        if (ignore) {
          return;
        }

        if (!row) {
          setDetailsStatus("notFound");

          return;
        }

        setDetails(row);
        setDetailsStatus("loaded");
      })
      .catch((error: unknown) => {
        if (ignore) {
          return;
        }

        console.error("Error loading release details", error);
        setDetailsStatus("failed");
      });

    return () => {
      ignore = true;
    };
  }, [isExpanded, releaseId, primaryDbSource]);

  const displayRow = releaseSummary ?? rowFromDetails(details);
  const versionLabel =
    displayRow?.version ??
    (detailsStatus === "loading" ? "Loading\u2026" : "Release");
  const displayFormats = displayRow?.formats ?? [];
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [checkedDbSources, setCheckedDbSources] = useState<Set<DbSource>>(
    () => new Set(ALL_DB_SOURCES),
  );

  const openConfirm = () => {
    setDeleteError(undefined);
    setCheckedDbSources(new Set(ALL_DB_SOURCES));
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (isDeleting) {
      return;
    }

    setIsConfirmOpen(false);
    setDeleteError(undefined);
  };

  const handleToggleDbSource = (source: DbSource) => {
    setCheckedDbSources((prev) => {
      const next = new Set(prev);

      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }

      return next;
    });
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setDeleteError(undefined);

    deleteReleaseFromDbSources(releaseId, checkedDbSources)
      .then((outcomes: DeleteReleaseOutcome[]) => {
        const errors = outcomes
          .filter((outcome) => outcome.status === "rejected")
          .map((outcome) => outcome.reason);

        console.info("Deleted release", {
          outcomes,
          errors: errors.length > 0 ? errors : undefined,
        });
        setIsConfirmOpen(false);
        onDeleted(releaseId, buildDeleteReleaseFeedback(outcomes).errors);
      })
      .catch((error: unknown) => {
        console.error("Failed to delete release", error);
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete release",
        );
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <li className={entryReleaseClassName}>
      <div className={releaseRowClassName}>
        <button
          type="button"
          className={releaseToggleClassName}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <span className={releaseRowMainClassName}>
            <span className={releaseVersionClassName}>{versionLabel}</span>
            {displayFormats.length > 0 && ` (${displayFormats.join(", ")})`}
            {isRecentlyAdded && (
              <span className={recentlyAddedBadgeClassName}>
                Recently added
              </span>
            )}
            {isRecentlyEdited && (
              <span className={recentlyEditedBadgeClassName}>
                Recently edited
              </span>
            )}
          </span>
          <span
            className={isExpanded ? chevronExpandedClassName : chevronClassName}
            aria-hidden
          />
        </button>
        <button
          type="button"
          className={releaseRemoveClassName}
          onClick={openConfirm}
          aria-label={`Remove release ${versionLabel}`}
          title="Remove release"
        >
          Remove
        </button>
      </div>
      <div
        className={
          isExpanded ? detailsSlideOpenClassName : detailsSlideClassName
        }
      >
        <div className={detailsSlideInnerClassName}>
          {isExpanded && (
            <div className={releaseDetailsPanelClassName}>
              {detailsStatus === "loading" && (
                <p className={detailsLoadingClassName}>Loading details…</p>
              )}
              {detailsStatus === "notFound" && (
                <p className={detailsMissingClassName}>
                  This release could not be found in this entry&apos;s
                  collection.
                </p>
              )}
              {detailsStatus === "failed" && (
                <p className={detailsMissingClassName}>
                  Could not load release details.
                </p>
              )}
              {detailsStatus === "loaded" && details && (
                <ReleaseDetails
                  entry={entry}
                  release={details}
                  allCountries={allCountries}
                  primaryDbSource={primaryDbSource}
                  showReleaseActions={showReleaseActions}
                  onEdit={onEdit}
                  onUseAsBlueprint={onUseAsBlueprint}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Remove release?"
        description={
          <>
            <p>
              Remove release <strong>{versionLabel}</strong> from your
              collection? This cannot be undone.
            </p>
            <DbSourcesCheckboxes
              heading="Remove from databases"
              headingId="delete-release-db-sources-heading"
              idPrefix="delete-release-db-source"
              activeDbSource={primaryDbSource}
              checkedSources={checkedDbSources}
              onToggle={handleToggleDbSource}
            />
          </>
        }
        confirmLabel="Remove"
        tone="danger"
        isBusy={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
      />
    </li>
  );
};

export default EntryRelease;

/** Derives the collapsed-row header shape from already-fetched release details. */
const rowFromDetails = (
  details: ReleaseByIdResult | undefined,
): EntryReleaseRow | undefined =>
  details
    ? {
        releaseId: details.releaseId,
        version: details.releaseVersion,
        formats: Array.from(
          new Set(details.formats.map((format) => format.shortName)),
        ),
      }
    : undefined;

type DeleteReleaseOutcome =
  | {
      source: DbSource;
      status: "fulfilled";
      result: DeleteReleaseResult;
    }
  | {
      source: DbSource;
      status: "rejected";
      reason: unknown;
    };

const deleteReleaseFromDbSources = (
  releaseId: string,
  dbSources: Set<DbSource>,
): Promise<DeleteReleaseOutcome[]> =>
  Promise.all(
    Array.from(dbSources).map((source) =>
      api
        .deleteRelease(releaseId, source)
        .then((result) => ({ status: "fulfilled" as const, result, source }))
        .catch(
          (reason: unknown) =>
            ({ status: "rejected" as const, reason, source }) as const,
        ),
    ),
  );

const formatDeleteReleaseError = (reason: unknown): string =>
  reason instanceof Error ? reason.message : "Failed to delete release";

const buildDeleteReleaseFeedback = (
  outcomes: DeleteReleaseOutcome[],
): { errors: string[] } => {
  const errors: string[] = [];

  for (const outcome of outcomes) {
    if (outcome.status === "rejected") {
      const { source, reason } = outcome;

      const errorMessage = `Failed to delete release in ${dbSourceLabel(source)}`;
      console.error(errorMessage, reason);

      errors.push(`${errorMessage}: ${formatDeleteReleaseError(reason)}`);
    }
  }

  return { errors };
};
