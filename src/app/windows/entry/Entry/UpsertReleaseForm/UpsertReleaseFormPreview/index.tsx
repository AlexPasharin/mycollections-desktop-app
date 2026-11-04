import type { FC } from "react";

import type { ValidatedUpsertReleaseFormDraft } from "../upsertReleaseFormUtils/formValues";
import {
  toReleaseCatNumbersJson,
  toReleaseCountriesJson,
  toReleaseMatrixRunoutJson,
} from "../upsertReleaseFormUtils/toUpsertMusicalReleaseInput";

import FormPreviewField, {
  JsonField,
} from "@/app/components/Form/FormPreviewField";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { TagListItem } from "@/types/tags";
import { nullIfEmpty } from "@/utils/common";
import { generalizedDateToString } from "@/utils/date";

type UpsertReleaseFormPreviewProps = {
  formState: ValidatedUpsertReleaseFormDraft;
  allFormats: ReleasesFormatListItem[];
  tagsAvailableForReleases: TagListItem[];
};

const listClassName = "mt-[0.2rem] mb-0 pl-[1.1rem]";

const UpsertReleaseFormPreview: FC<UpsertReleaseFormPreviewProps> = ({
  formState,
  allFormats,
  tagsAvailableForReleases,
}) => {
  const formatShortNameById = new Map(
    allFormats.map((format) => [format.formatId, format.shortName] as const),
  );

  const releaseDate = generalizedDateToString(formState.releaseDate);
  const discogsUrl = nullIfEmpty(formState.discogsUrl);
  const selectedTagNames = tagsAvailableForReleases
    .filter((t) => formState.selectedTags.has(t.tagId))
    .map((t) => t.tag);
  const comment = nullIfEmpty(formState.comment);
  const conditionProblems = nullIfEmpty(formState.conditionProblems);
  const relationToQueen = nullIfEmpty(formState.relationToQueen);

  const countriesJson = toReleaseCountriesJson(formState.countries);
  const catNumbersJson = toReleaseCatNumbersJson(formState.catalogueNumbers);
  const matrixRunoutJson = toReleaseMatrixRunoutJson(formState.matrixRunout);
  const formats = formState.formats;

  const relatedReleases = formState.relatedReleases.sort(
    (a, b) => parseInt(a.orderNumber, 10) - parseInt(b.orderNumber, 10),
  );

  return (
    <div className="flex flex-col gap-[0.45rem] text-[0.92em]">
      <FormPreviewField label="Version">
        {formState.releaseVersion}
      </FormPreviewField>
      <FormPreviewField label="Name">{formState.name.name}</FormPreviewField>
      <FormPreviewField label="Release date">{releaseDate}</FormPreviewField>
      <FormPreviewField label="Discogs URL">
        {discogsUrl === null ? null : (
          <a href={discogsUrl} target="_blank" rel="noreferrer">
            {discogsUrl}
          </a>
        )}
      </FormPreviewField>
      <FormPreviewField label="Formats">
        {formats.length ? (
          <ul className={listClassName}>
            {formats.map((row) => {
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
                    <span className="ml-[0.35rem] text-gray-500">
                      ({flags.join(", ")})
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </FormPreviewField>
      <JsonField label="Countries" value={countriesJson} />
      <JsonField label="Catalogue numbers" value={catNumbersJson} />
      <JsonField label="Matrix / runout" value={matrixRunoutJson} />
      <FormPreviewField label="Tags">
        {selectedTagNames.join(", ")}
      </FormPreviewField>
      <FormPreviewField label="Related releases">
        {relatedReleases.length === 0 ? null : (
          <ul className={listClassName}>
            {relatedReleases.map((row) => (
              <li key={row.id}>
                {row.releaseId}
                {" — "}
                {row.relation}
              </li>
            ))}
          </ul>
        )}
      </FormPreviewField>
      <FormPreviewField label="Part of Queen collection">
        {formState.partOfQueenCollection ? "Yes" : "No"}
      </FormPreviewField>
      <JsonField label="Relation to Queen" value={relationToQueen} />
      <JsonField label="Comment" value={comment} />
      <JsonField label="Condition problems" value={conditionProblems} />
    </div>
  );
};

export default UpsertReleaseFormPreview;
