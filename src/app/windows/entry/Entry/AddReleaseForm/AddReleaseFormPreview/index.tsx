import type { FC } from "react";

import styles from "./AddReleaseFormPreview.module.css";

import type { AddReleaseFormDraft } from "../addReleaseFormUtils/formValues";
import {
  toReleaseCatNumbersJson,
  toReleaseCountriesJson,
  toReleaseMatrixRunoutJson,
} from "../addReleaseFormUtils/toCreateMusicalReleaseInput";

import FormPreviewField, {
  FormPreviewBlockField,
} from "@/app/components/FormPreviewField";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { TagListItem } from "@/types/tags";
import { nullIfEmpty } from "@/utils/common";
import { generalizedDateToString } from "@/utils/date";
import { orPlaceholder } from "@/utils/form";


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

  const releaseDate = generalizedDateToString(form.releaseDate.value);
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
      <FormPreviewField label="Version">{form.releaseVersion.value}</FormPreviewField>
      <FormPreviewField label="Name">{form.name.value.name}</FormPreviewField>
      <FormPreviewField label="Release date">{orPlaceholder(releaseDate)}</FormPreviewField>
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
      </FormPreviewBlockField>
      <JsonField label="Countries" value={countriesJson} />
      <JsonField label="Catalogue numbers" value={catNumbersJson} />
      <JsonField label="Matrix / runout" value={matrixRunoutJson} />
      <FormPreviewField label="Tags">
        {orPlaceholder(
          selectedTagNames.length === 0 ? null : selectedTagNames.join(", "),
        )}
      </FormPreviewField>
      <FormPreviewField label="Part of Queen collection">
        {form.partOfQueenCollection.value ? "Yes" : "No"}
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

export default AddReleaseFormPreview;

type JsonFieldProps = {
  label: string;
  value: unknown;
};

const JsonField: FC<JsonFieldProps> = ({ label, value }) => (
  <FormPreviewBlockField label={label}>
    <pre className={styles.jsonBlock}>{JSON.stringify(value, null, 2)}</pre>
  </FormPreviewBlockField>
);
