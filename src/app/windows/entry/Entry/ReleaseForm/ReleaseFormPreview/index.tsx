import type { FC } from "react";

import type { ReleaseFormState } from "../releaseFormUtils/formValues";
import {
  toReleaseCatNumbersJson,
  toReleaseCountriesJson,
  toReleaseMatrixRunoutJson,
} from "../releaseFormUtils/toUpsertMusicalReleaseInput";

import FormPreviewField, {
  JsonField,
} from "@/app/components/Form/FormPreviewField";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { TagListItem } from "@/types/tags";
import { nullIfEmpty } from "@/utils/common";
import { generalizedDateToString } from "@/utils/date";

type ReleaseFormPreviewProps = {
  formState: ReleaseFormState;
  allFormats: ReleasesFormatListItem[];
  tagsAvailableForReleases: TagListItem[];
};

const listClassName = "mt-[0.2rem] mb-0 pl-[1.1rem]";

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
  const formats = formState.formats.value;

  const relatedReleases = formState.relatedReleases.value.sort(
    (a, b) => parseInt(a.orderNumber, 10) - parseInt(b.orderNumber, 10),
  );

  return (
    <div className="flex flex-col gap-[0.45rem] text-[0.92em]">
      <FormPreviewField label="Version">
        {formState.releaseVersion.value}
      </FormPreviewField>
      <FormPreviewField label="Name">
        {formState.name.value.name}
      </FormPreviewField>
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
        {formState.partOfQueenCollection.value ? "Yes" : "No"}
      </FormPreviewField>
      <JsonField label="Relation to Queen" value={relationToQueen} />
      <JsonField label="Comment" value={comment} />
      <JsonField label="Condition problems" value={conditionProblems} />
    </div>
  );
};

export default ReleaseFormPreview;
