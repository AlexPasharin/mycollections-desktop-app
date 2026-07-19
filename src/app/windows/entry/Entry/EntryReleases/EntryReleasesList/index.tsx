import { type FC } from "react";

import styles from "./EntryReleasesList.module.css";

import EntryRelease from "../EntryRelease";

import type { DbSource } from "@/db/db-source";
import type { CountryListItem } from "@/types/countries";
import type { EntryByIdResult } from "@/types/entries";
import type {
  EntryRelease as EntryReleaseRow,
  ReleaseByIdResult,
} from "@/types/releases";

type EntryReleasesListProps = {
  entry: EntryByIdResult;
  primaryDbSource: DbSource;

  /** Full collection rows (empty in focused mode). */
  releases: EntryReleaseRow[];
  allCountries: CountryListItem[];

  /**
   * When set, render only this release (no row data needed): it starts expanded
   * and loads its own details, which also supply its header.
   */
  focusedReleaseId: string | null;
  showReleaseActions: boolean;
  latestAddedReleaseId: string | undefined;
  latestUpdatedReleaseId: string | undefined;
  onUseReleaseAsBlueprint: (releaseBlueprint: ReleaseByIdResult) => void;
  onEditRelease: (release: ReleaseByIdResult) => void;
  onReleaseDeleted: (deletedReleaseVersion: string, errors: string[]) => void;
};

const EntryReleasesList: FC<EntryReleasesListProps> = ({
  entry,
  primaryDbSource,
  releases,
  allCountries,
  focusedReleaseId,
  showReleaseActions,
  latestAddedReleaseId,
  latestUpdatedReleaseId,
  onUseReleaseAsBlueprint,
  onEditRelease,
  onReleaseDeleted,
}) => {
  // Focused mode renders a single release by id with no row data (its header
  // comes from the loaded details); otherwise render the full collection rows.
  const items = focusedReleaseId
    ? [{ releaseId: focusedReleaseId, row: undefined }]
    : releases.map((release) => ({
        releaseId: release.releaseId,
        row: release,
      }));

  return (
    <ul className={styles.releasesList}>
      {items.map(({ releaseId, row }) => (
        <EntryRelease
          key={releaseId}
          entry={entry}
          primaryDbSource={primaryDbSource}
          releaseId={releaseId}
          releaseSummary={row}
          allCountries={allCountries}
          defaultExpanded={releaseId === focusedReleaseId}
          isRecentlyAdded={releaseId === latestAddedReleaseId}
          isRecentlyEdited={releaseId === latestUpdatedReleaseId}
          showReleaseActions={showReleaseActions}
          onUseAsBlueprint={onUseReleaseAsBlueprint}
          onEdit={onEditRelease}
          onDeleted={onReleaseDeleted}
        />
      ))}
    </ul>
  );
};

export default EntryReleasesList;
