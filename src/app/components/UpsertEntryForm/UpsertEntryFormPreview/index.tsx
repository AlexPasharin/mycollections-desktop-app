import type { FC } from "react";

import type { ValidatedUpsertEntryFormDraft } from "../upsertEntryFormUtils/formValues";

import FormPreviewField, {
  FormPreviewBlockField,
} from "@/app/components/Form/FormPreviewField";
import type { EntryTypeListItem } from "@/types/entryTypes";
import type { TagListItem } from "@/types/tags";
import { nullIfEmpty } from "@/utils/common";
import { generalizedDateToString } from "@/utils/date";
import { orPlaceholder } from "@/utils/form";

type UpsertEntryFormPreviewProps = {
  form: ValidatedUpsertEntryFormDraft;
  tags: TagListItem[];
  allEntryTypes: EntryTypeListItem[];
};

const UpsertEntryFormPreview: FC<UpsertEntryFormPreviewProps> = ({
  form,
  tags,
  allEntryTypes,
}) => {
  const originalReleaseDate = generalizedDateToString(form.originalReleaseDate);
  const discogsUrl = nullIfEmpty(form.discogsUrl);
  const comment = nullIfEmpty(form.comment);
  const relationToQueen = nullIfEmpty(form.relationToQueen);

  const selectedTagNames = tags
    .filter((t) => form.selectedTags.has(t.tagId))
    .map((t) => t.tag);

  const typeNameById = new Map(
    allEntryTypes.map(
      (entryType) => [entryType.entryTypeId, entryType.name] as const,
    ),
  );

  const relatedEntries = form.relatedEntries.sort(
    (a, b) => parseInt(a.orderNumber, 10) - parseInt(b.orderNumber, 10),
  );

  const selectedTypeNames = Array.from(form.selectedTypes, (typeId) => {
    return typeNameById.get(typeId) ?? typeId;
  });

  return (
    <div className="flex flex-col gap-[0.45rem] text-[0.92em]">
      <FormPreviewField label="Main name">{form.mainName}</FormPreviewField>
      <FormPreviewBlockField label="Artists">
        {form.artists.length === 0 ? (
          <p className="whitespace-pre-wrap">{orPlaceholder(null)}</p>
        ) : (
          <ul className="mt-[0.2rem] pl-[1.1rem]">
            {form.artists.map((row) => {
              const altNameId = nullIfEmpty(row.entryArtistAltNameId.trim());
              const mainLabel = row.isEntriesMainArtist ? " (main)" : "";

              return (
                <li key={row.id}>
                  {orPlaceholder(row.artistId.trim())}
                  {altNameId !== null && ` — alt name ${altNameId}`}
                  {mainLabel}
                </li>
              );
            })}
          </ul>
        )}
      </FormPreviewBlockField>
      <FormPreviewField label="Original release date">
        {orPlaceholder(originalReleaseDate)}
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
      <FormPreviewField label="Tags">
        {orPlaceholder(
          selectedTagNames.length === 0 ? null : selectedTagNames.join(", "),
        )}
      </FormPreviewField>
      <FormPreviewField label="Types">
        {orPlaceholder(
          selectedTypeNames.length === 0 ? null : selectedTypeNames.join(", "),
        )}
      </FormPreviewField>
      <FormPreviewBlockField label="Alternative names">
        {form.altNames.length === 0 ? (
          <p className="whitespace-pre-wrap">{orPlaceholder(null)}</p>
        ) : (
          <ul className="mt-[0.2rem] pl-[1.1rem]">
            {form.altNames.map((row) => (
              <li key={row.id}>{orPlaceholder(row.name.trim())}</li>
            ))}
          </ul>
        )}
      </FormPreviewBlockField>
      <FormPreviewBlockField label="Related entries">
        {relatedEntries.length === 0 ? (
          <p className="whitespace-pre-wrap">{orPlaceholder(null)}</p>
        ) : (
          <ul className="mt-[0.2rem] pl-[1.1rem]">
            {relatedEntries.map((row) => (
              <li key={row.id}>
                {orPlaceholder(row.entryId.trim())} — {row.relation}
              </li>
            ))}
          </ul>
        )}
      </FormPreviewBlockField>
      <FormPreviewField label="Part of Queen collection">
        {form.partOfQueenCollection ? "Yes" : "No"}
      </FormPreviewField>
      <FormPreviewBlockField label="Relation to Queen">
        <p className="whitespace-pre-wrap">{orPlaceholder(relationToQueen)}</p>
      </FormPreviewBlockField>
      <FormPreviewBlockField label="Comment">
        <p className="whitespace-pre-wrap">{orPlaceholder(comment)}</p>
      </FormPreviewBlockField>
    </div>
  );
};

export default UpsertEntryFormPreview;
