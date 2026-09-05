import { type FC, type PropsWithChildren } from "react";

import ReleaseCatNumbers from "./ReleaseCatNumbers";
import ReleaseCountries from "./ReleaseCountries";
import ReleaseFormatItem from "./ReleaseFormatItem";
import ReleaseMatrixRunout from "./ReleaseMatrixRunout";

import api from "../../../api";

import CopyTextCta from "@/app/components/CopyTextCta";
import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { DbSource } from "@/db/db-source";
import type { CountryListItem } from "@/types/countries";
import type { EntryByIdResult } from "@/types/entries";
import type { RelatedReleaseItem, ReleaseByIdResult } from "@/types/releases";
import { formatEntryArtistsLabel } from "@/utils/artist";
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

const detailFieldClassName = "m-0 mb-[0.45rem]";
const detailBlockClassName = "m-0 mb-[0.55rem]";
const detailBlockLabelClassName = "mb-1 block font-semibold";

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
    parentReleases,
    childReleases,
  } = release;

  return (
    <div className="pt-[0.65rem] text-[0.92em]">
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
          {alternativeName.name}
        </DetailLabeledField>
      )}
      {formats.length > 0 && (
        <div className={detailBlockClassName}>
          <span className={detailBlockLabelClassName}>
            {formats.length === 1 ? "Format:" : "Formats:"}
          </span>
          <ul className="m-0 mt-1 list-none pl-0">
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
        <div className={detailBlockClassName}>
          <span className={detailBlockLabelClassName}>Tags:</span>
          <ul className="m-0 mt-1 list-none pl-0">
            {tags.map(({ tagId, tag }) => (
              <li key={tagId} className="m-0 my-1 italic">
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
        <p className={detailFieldClassName}>
          <span className="font-semibold italic">Part of Queen collection</span>
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
        parentReleases={parentReleases}
        childReleases={childReleases}
        primaryDbSource={primaryDbSource}
      />
      {showReleaseActions && (
        <div className="mt-4 flex flex-wrap gap-[0.55rem] border-t border-[#e0dcf5] pt-[0.85rem]">
          <button
            type="button"
            className="m-0 cursor-pointer rounded-md border border-indigo-600 bg-indigo-600 px-[0.85rem] py-[0.45rem] text-[0.92em] font-medium text-white transition-[background-color,border-color,color] duration-150 [font:inherit] hover:border-indigo-700 hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            onClick={() => onEdit(release)}
            aria-label={`Edit release ${releaseVersion}`}
          >
            Edit release
          </button>
          <button
            type="button"
            className="m-0 cursor-pointer rounded-md border border-indigo-200 bg-indigo-50 px-[0.85rem] py-[0.45rem] text-[0.92em] font-medium text-indigo-800 transition-[background-color,border-color,color] duration-150 [font:inherit] hover:border-indigo-600 hover:bg-indigo-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
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
  <p className={detailFieldClassName}>
    <span className="font-semibold">{label}: </span>
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
    <div className="mt-[0.85rem] border-t border-[#e0dcf5] pt-[0.85rem] text-[0.92em]">
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
  <div className="[&+&]:mt-[0.65rem]">
    <span className="mb-1 block font-semibold">{label}</span>
    <ul className="m-0 list-none pl-0 [&>li+li]:mt-[0.2rem]">
      {releases.map((relatedRelease) => (
        <li key={relatedRelease.releaseId}>
          <button
            type="button"
            className="m-0 cursor-pointer border-none bg-transparent p-0 text-left text-[#1a5fb4] underline [font:inherit] hover:text-[#0d3d82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a5fb4]"
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
  `${formatEntryArtistsLabel(relatedRelease.artists)} - ${relatedRelease.entryMainName} (${relatedRelease.releaseVersion})`;
