import { type FC, type PropsWithChildren } from "react";

import ReleaseCatNumbers from "./ReleaseCatNumbers";
import ReleaseCountries from "./ReleaseCountries";
import styles from "./ReleaseDetails.module.css";
import ReleaseFormatItem from "./ReleaseFormatItem";
import ReleaseMatrixRunout from "./ReleaseMatrixRunout";

import api from "../../../api";

import CopyTextCta from "@/app/components/CopyTextCta";
import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { DbSource } from "@/db/db-source";
import type { CountryListItem } from "@/types/countries";
import type { EntryByIdResult } from "@/types/entries";
import type {
  RelatedReleaseArtist,
  RelatedReleaseItem,
  ReleaseByIdResult,
} from "@/types/releases";
import { formatGeneralizedDate } from "@/utils/date";

type ReleaseDetailsProps = {
  entry: EntryByIdResult;
  release: ReleaseByIdResult;
  allCountries: CountryListItem[];
  primaryDbSource: DbSource;
  showReleaseActions: boolean;
  onEdit: (release: ReleaseByIdResult) => void;
  onUseAsBlueprint: (releaseBlueprint: ReleaseByIdResult) => void;
};

const ReleaseDetails: FC<ReleaseDetailsProps> = ({
  entry,
  release,
  allCountries,
  primaryDbSource,
  showReleaseActions,
  onEdit,
  onUseAsBlueprint,
}) => {
  const {
    releaseVersion,
    releaseDate,
    alternativeName,
    formats,
    discogsUrl,
    tags,
    countries,
    catalogueNumbers,
    matrixRunout,
    comment,
    conditionProblems,
    partOfQueenCollection,
    relationToQueen,
  } = release;

  return (
    <div className={styles.releaseDetails}>
      <DetailLabeledField label="Version">{releaseVersion}</DetailLabeledField>
      <DetailLabeledField label="Release date">
        {releaseDate === null ? (
          "(Unknown)"
        ) : "error" in releaseDate ? (
          <DataWithErrorDisplay
            value={releaseDate.value}
            error={releaseDate.error}
          />
        ) : (
          formatGeneralizedDate(releaseDate)
        )}
      </DetailLabeledField>
      {alternativeName && (
        <DetailLabeledField label="Released as">
          {alternativeName}
        </DetailLabeledField>
      )}
      {formats.length > 0 && (
        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>
            {formats.length === 1 ? "Format:" : "Formats:"}
          </span>
          <ul className={styles.formatsList}>
            {formats.map((format) => (
              <ReleaseFormatItem key={format.id} format={format} />
            ))}
          </ul>
        </div>
      )}
      {discogsUrl && (
        <DetailLabeledField label="Discogs">
          <a href={discogsUrl} target="_blank" rel="noreferrer">
            {discogsUrl}
          </a>
        </DetailLabeledField>
      )}
      {tags.length > 0 && (
        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>Tags:</span>
          <ul className={styles.tagsList}>
            {tags.map(({ tagId, tag }) => (
              <li key={tagId} className={styles.tagsListItem}>
                {tag}
              </li>
            ))}
          </ul>
        </div>
      )}
      <ReleaseCountries
        releaseCountries={countries}
        allCountries={allCountries}
      />
      {partOfQueenCollection && !entry.partOfQueenCollection && (
        <p className={styles.detailField}>
          <span className={styles.detailLabelItalic}>
            Part of Queen collection
          </span>
        </p>
      )}
      {relationToQueen && (
        <DetailLabeledField label="Relation to Queen">
          {relationToQueen}
        </DetailLabeledField>
      )}
      {comment && (
        <DetailLabeledField label="Comment">{comment}</DetailLabeledField>
      )}
      {conditionProblems && (
        <DetailLabeledField label="Condition problems">
          {conditionProblems}
        </DetailLabeledField>
      )}
      <ReleaseCatNumbers catalogueNumbers={catalogueNumbers} />
      <ReleaseMatrixRunout matrixRunout={matrixRunout} />
      <RelatedReleases
        parentReleases={release.parentReleases}
        childReleases={release.childReleases}
        primaryDbSource={primaryDbSource}
      />
      {showReleaseActions && (
        <div className={styles.detailsActions}>
          <button
            type="button"
            className={styles.detailsActionButton}
            onClick={() => onEdit(release)}
            aria-label={`Edit release ${releaseVersion}`}
          >
            Edit release
          </button>
          <button
            type="button"
            className={styles.detailsActionButtonSecondary}
            onClick={() => onUseAsBlueprint(release)}
            aria-label={`Use release ${releaseVersion} as a blueprint to add a new release`}
          >
            Use as a blueprint to add a new release
          </button>
        </div>
      )}
      <CopyTextCta
        text={release.releaseId}
        label="copy release's id"
        successMessage="Release id copied to clipboard"
        errorMessage="Could not copy release id to clipboard"
      />
    </div>
  );
};

export default ReleaseDetails;

type DetailLabeledFieldProps = PropsWithChildren<{
  label: string;
}>;

const DetailLabeledField: FC<DetailLabeledFieldProps> = ({
  label,
  children,
}) => (
  <p className={styles.detailField}>
    <span className={styles.detailLabel}>{label}: </span>
    {children}
  </p>
);

type RelatedReleasesProps = {
  parentReleases: RelatedReleaseItem[];
  childReleases: RelatedReleaseItem[];
  primaryDbSource: DbSource;
};

const RelatedReleases: FC<RelatedReleasesProps> = ({
  parentReleases,
  childReleases,
  primaryDbSource,
}) => {
  if (parentReleases.length === 0 && childReleases.length === 0) {
    return null;
  }

  const openRelatedReleaseWindow = (relatedRelease: RelatedReleaseItem) => {
    api.openNewEntryWindow({
      entryId: relatedRelease.entryId,
      source: primaryDbSource,
      releaseId: relatedRelease.releaseId,
    });
  };

  return (
    <div className={styles.relatedReleases}>
      {parentReleases.length > 0 && (
        <RelatedReleasesSection
          label="Parent releases:"
          releases={parentReleases}
          onReleaseSelect={openRelatedReleaseWindow}
        />
      )}
      {childReleases.length > 0 && (
        <RelatedReleasesSection
          label="Child releases:"
          releases={childReleases}
          onReleaseSelect={openRelatedReleaseWindow}
        />
      )}
    </div>
  );
};

type RelatedReleasesSectionProps = {
  label: string;
  releases: RelatedReleaseItem[];
  onReleaseSelect: (release: RelatedReleaseItem) => void;
};

const RelatedReleasesSection: FC<RelatedReleasesSectionProps> = ({
  label,
  releases,
  onReleaseSelect,
}) => (
  <div className={styles.relatedReleasesSection}>
    <span className={styles.relatedReleasesLabel}>{label}</span>
    <ul className={styles.relatedReleasesList}>
      {releases.map((relatedRelease) => (
        <li key={relatedRelease.releaseId}>
          <button
            type="button"
            className={styles.relatedReleaseLink}
            onClick={() => onReleaseSelect(relatedRelease)}
          >
            {formatRelatedReleaseLabel(relatedRelease)}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

const formatRelatedReleaseLabel = (
  relatedRelease: RelatedReleaseItem,
): string =>
  `${formatRelatedReleaseArtist(relatedRelease.artists)} - ${relatedRelease.entryMainName} (${relatedRelease.releaseVersion})`;

const formatRelatedReleaseArtist = (
  artists: RelatedReleaseArtist[],
): string => {
  const mainArtist = artists.find(
    (artist) => artist.isEntriesMainArtist === true,
  );

  if (mainArtist) {
    return mainArtist.artistName;
  }

  if (artists.length > 0) {
    return artists.map((artist) => artist.artistName).join(", ");
  }

  return "(Unknown artist)";
};
