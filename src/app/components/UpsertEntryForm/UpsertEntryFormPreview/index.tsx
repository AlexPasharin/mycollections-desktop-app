import type { FC } from "react";

import type { UpsertEntryFormDraft } from "../upsertEntryFormUtils/formValues";

import FormPreviewField, {
  FormPreviewBlockField,
} from "@/app/components/FormPreviewField";
import type { EntryTypeListItem } from "@/types/entryTypes";
import type { TagListItem } from "@/types/tags";
import { nullIfEmpty } from "@/utils/common";
import { generalizedDateToString } from "@/utils/date";
import { orPlaceholder } from "@/utils/form";

type UpsertEntryFormPreviewProps = {
  form: UpsertEntryFormDraft;
  tags: TagListItem[];
  allEntryTypes: EntryTypeListItem[];
};

const UpsertEntryFormPreview: FC<UpsertEntryFormPreviewProps> = ({
  form,
  tags,
  allEntryTypes,
}) => {
  const originalReleaseDate = generalizedDateToString(
    form.originalReleaseDate.value,
  );
  const discogsUrl = nullIfEmpty(form.discogsUrl.value);
  const comment = nullIfEmpty(form.comment.value);
  const relationToQueen = nullIfEmpty(form.relationToQueen.value);

  const selectedTagNames = tags
    .filter((t) => form.selectedTags.value.has(t.tagId))
    .map((t) => t.tag);

  const typeNameById = new Map(
    allEntryTypes.map(
      (entryType) => [entryType.entryTypeId, entryType.name] as const,
    ),
  );

  const selectedTypeNames = Array.from(form.selectedTypes.value, (typeId) => {
    return typeNameById.get(typeId) ?? typeId;
  });

  return (
    <div className="flex flex-col gap-[0.45rem] text-[0.92em]">
      <FormPreviewField label="Main name">
        {form.mainName.value}
      </FormPreviewField>
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
        {form.altNames.value.length === 0 ? (
          <p className="whitespace-pre-wrap">{orPlaceholder(null)}</p>
        ) : (
          <ul className="mt-[0.2rem] pl-[1.1rem]">
            {form.altNames.value.map((row) => (
              <li key={row.id}>{orPlaceholder(row.name.trim())}</li>
            ))}
          </ul>
        )}
      </FormPreviewBlockField>
      <FormPreviewField label="Part of Queen collection">
        {form.partOfQueenCollection.value ? "Yes" : "No"}
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
