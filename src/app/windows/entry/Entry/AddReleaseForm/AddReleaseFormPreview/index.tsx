import type { FC, ReactNode } from "react";

import styles from "./AddReleaseFormPreview.module.css";

import type { AddReleaseFormDraft } from "../addReleaseFormUtils/formValues";
import {
  nullIfEmpty,
  toReleaseCatNumbersJson,
  toReleaseCountriesJson,
  toReleaseDateString,
  toReleaseMatrixRunoutJson,
} from "../addReleaseFormUtils/toCreateMusicalReleaseInput";

import type { ReleasesFormatListItem } from "@/types/formats";
import type { TagListItem } from "@/types/tags";

const EMPTY_PLACEHOLDER = "(none)";

type AddReleaseFormPreviewProps = {
  form: AddReleaseFormDraft;
  allFormats: ReleasesFormatListItem[];
  tags: TagListItem[];
};

const AddReleaseFormPreview: FC<AddReleaseFormPreviewProps> = ({
  form,
  allFormats,
  tags,
}) => {
  const formatShortNameById = new Map(
    allFormats.map((format) => [format.formatId, format.shortName] as const),
  );

  const releaseDate = toReleaseDateString(form.releaseDate.value);
  const discogsUrl = nullIfEmpty(form.discogsUrl.value);
  const selectedTagNames = tags
    .filter((t) => form.selectedTags.value.has(t.tagId))
    .map((t) => t.tag);
  const comment = nullIfEmpty(form.comment.value);
  const conditionProblems = nullIfEmpty(form.conditionProblems.value);
  const relationToQueen = nullIfEmpty(form.relationToQueen.value);

  const countriesJson = toReleaseCountriesJson(form.countries.value);
  const catNumbersJson = toReleaseCatNumbersJson(form.catalogueNumbers.value);
  const matrixRunoutJson = toReleaseMatrixRunoutJson(form.matrixRunout.value);

  return (
    <div className={styles.preview}>
      <Field label="Version">{form.releaseVersion.value}</Field>
      <Field label="Name">{form.name.value.name}</Field>
      <Field label="Release date">{orPlaceholder(releaseDate)}</Field>
      <Field label="Discogs URL">
        {discogsUrl === null ? (
          orPlaceholder(discogsUrl)
        ) : (
          <a href={discogsUrl} target="_blank" rel="noreferrer">
            {discogsUrl}
          </a>
        )}
      </Field>
      <BlockField label="Formats">
        <ul className={styles.list}>
          {form.formats.value.map((row) => {
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
      </BlockField>
      <JsonField label="Countries" value={countriesJson} />
      <JsonField label="Catalogue numbers" value={catNumbersJson} />
      <JsonField label="Matrix / runout" value={matrixRunoutJson} />
      <Field label="Tags">
        {orPlaceholder(
          selectedTagNames.length === 0 ? null : selectedTagNames.join(", "),
        )}
      </Field>
      <Field label="Part of Queen collection">
        {form.partOfQueenCollection.value ? "Yes" : "No"}
      </Field>
      <BlockField label="Relation to Queen">
        <p className={styles.multiline}>{orPlaceholder(relationToQueen)}</p>
      </BlockField>
      <BlockField label="Comment">
        <p className={styles.multiline}>{orPlaceholder(comment)}</p>
      </BlockField>
      <BlockField label="Condition problems">
        <p className={styles.multiline}>{orPlaceholder(conditionProblems)}</p>
      </BlockField>
    </div>
  );
};

export default AddReleaseFormPreview;

const orPlaceholder = (value: string | null): string =>
  value ?? EMPTY_PLACEHOLDER;

type FieldProps = {
  label: string;
  children: ReactNode;
};

const Field: FC<FieldProps> = ({ label, children }) => (
  <p className={styles.field}>
    <span className={styles.label}>{label}:</span>
    {children}
  </p>
);

const BlockField: FC<FieldProps> = ({ label, children }) => (
  <div className={styles.field}>
    <span className={styles.labelBlock}>{label}:</span>
    {children}
  </div>
);

type JsonFieldProps = {
  label: string;
  value: unknown;
};

const JsonField: FC<JsonFieldProps> = ({ label, value }) => (
  <div className={styles.field}>
    <span className={styles.labelBlock}>{label}:</span>
    <pre className={styles.jsonBlock}>{JSON.stringify(value, null, 2)}</pre>
  </div>
);
