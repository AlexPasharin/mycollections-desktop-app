import { type FC, type PropsWithChildren } from "react";

import ReleaseCatNumbers from "./ReleaseCatNumbers";
import ReleaseCountries from "./ReleaseCountries";
import styles from "./ReleaseDetails.module.css";
import ReleaseFormatItem from "./ReleaseFormatItem";
import ReleaseMatrixRunout from "./ReleaseMatrixRunout";

import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { CountryListItem } from "@/types/countries";
import type { EntryByIdResult } from "@/types/entries";
import type { ReleaseByIdResult } from "@/types/releases";
import { formatGeneralizedDate } from "@/utils/date";

type ReleaseDetailsProps = {
  entry: EntryByIdResult;
  release: ReleaseByIdResult;
  allCountries: CountryListItem[];
};

const ReleaseDetails: FC<ReleaseDetailsProps> = ({
  entry,
  release,
  allCountries,
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
