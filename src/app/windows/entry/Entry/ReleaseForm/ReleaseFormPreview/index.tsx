import type { FC } from "react";

import styles from "./ReleaseFormPreview.module.css";

import type { ReleaseFormState } from "../releaseFormUtils/formValues";
import {
  toReleaseCatNumbersJson,
  toReleaseCountriesJson,
  toReleaseMatrixRunoutJson,
} from "../releaseFormUtils/toUpsertMusicalReleaseInput";

import FormPreviewField, {
  FormPreviewBlockField,
} from "@/app/components/FormPreviewField";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { TagListItem } from "@/types/tags";
import { nullIfEmpty } from "@/utils/common";
import { generalizedDateToString } from "@/utils/date";
import { orPlaceholder } from "@/utils/form";

type ReleaseFormPreviewProps = {
  formState: ReleaseFormState;
  allFormats: ReleasesFormatListItem[];
  tagsAvailableForReleases: TagListItem[];
};

const ReleaseFormPreview: FC<ReleaseFormPreviewProps> = ({
  formState,
  allFormats,
  tagsAvailableForReleases,
}) => {
  const formatShortNameById = new Map(
    allFormats.map((format) => [format.formatId, format.shortName] as const),
  );

  const releaseDate = generalizedDateToString(formState.releaseDate.value);
  const discogsUrl = nullIfEmpty(formState.discogsUrl.value);
  const selectedTagNames = tagsAvailableForReleases
    .filter((t) => formState.selectedTags.value.has(t.tagId))
    .map((t) => t.tag);
  const comment = nullIfEmpty(formState.comment.value);
  const conditionProblems = nullIfEmpty(formState.conditionProblems.value);
  const relationToQueen = nullIfEmpty(formState.relationToQueen.value);

  const countriesJson = toReleaseCountriesJson(formState.countries.value);
  const catNumbersJson = toReleaseCatNumbersJson(
    formState.catalogueNumbers.value,
  );
  const matrixRunoutJson = toReleaseMatrixRunoutJson(
    formState.matrixRunout.value,
  );

  return (
    <div className={styles.preview}>
      <FormPreviewField label="Version">
        {formState.releaseVersion.value}
      </FormPreviewField>
      <FormPreviewField label="Name">
        {formState.name.value.name}
      </FormPreviewField>
      <FormPreviewField label="Release date">
        {orPlaceholder(releaseDate)}
      </FormPreviewField>
      <FormPreviewField label="Discogs URL">
        {discogsUrl === null ? (
          orPlaceholder(discogsUrl)
        ) : (
          <a href={discogsUrl} target="_blank" rel="noreferrer">
            {discogsUrl}
          </a>
        )}
      </FormPreviewField>
      <FormPreviewBlockField label="Formats">
        <ul className={styles.list}>
          {formState.formats.value.map((row) => {
            const shortName =
              formatShortNameById.get(row.formatId) ?? "(unknown format)";
            const flags = [
              row.pictureSleeve ? "picture sleeve" : null,
              row.jukeboxHole ? "jukebox hole" : null,
            ].filter((value) => value !== null);

            return (
              <li key={row.id}>
                {shortName} × {row.amount}
                {flags.length > 0 && (
                  <span className={styles.flagsSuffix}>
                    ({flags.join(", ")})
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </FormPreviewBlockField>
      <JsonField label="Countries" value={countriesJson} />
      <JsonField label="Catalogue numbers" value={catNumbersJson} />
      <JsonField label="Matrix / runout" value={matrixRunoutJson} />
      <FormPreviewField label="Tags">
        {orPlaceholder(
          selectedTagNames.length === 0 ? null : selectedTagNames.join(", "),
        )}
      </FormPreviewField>
      <FormPreviewBlockField label="Related releases">
        {formState.relatedReleases.value.length === 0 ? (
          <p className={styles.multiline}>{orPlaceholder(null)}</p>
        ) : (
          <ul className={styles.list}>
            {formState.relatedReleases.value.map((row) => (
              <li key={row.id}>
                {row.releaseId}
                {" — "}
                {row.relation}
              </li>
            ))}
          </ul>
        )}
      </FormPreviewBlockField>
      <FormPreviewField label="Part of Queen collection">
        {formState.partOfQueenCollection.value ? "Yes" : "No"}
      </FormPreviewField>
      <FormPreviewBlockField label="Relation to Queen">
        <p className={styles.multiline}>{orPlaceholder(relationToQueen)}</p>
      </FormPreviewBlockField>
      <FormPreviewBlockField label="Comment">
        <p className={styles.multiline}>{orPlaceholder(comment)}</p>
      </FormPreviewBlockField>
      <FormPreviewBlockField label="Condition problems">
        <p className={styles.multiline}>{orPlaceholder(conditionProblems)}</p>
      </FormPreviewBlockField>
    </div>
  );
};

export default ReleaseFormPreview;

type JsonFieldProps = {
  label: string;
  value: unknown;
};

const JsonField: FC<JsonFieldProps> = ({ label, value }) => (
  <FormPreviewBlockField label={label}>
    <pre className={styles.jsonBlock}>{JSON.stringify(value, null, 2)}</pre>
  </FormPreviewBlockField>
);
