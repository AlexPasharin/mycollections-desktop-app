import type { FC } from "react";

import { type ArtistUpsertFormDraft } from "../artistUpsertFormUtils/formValues";

import FormPreviewField, {
  FormPreviewBlockField,
} from "@/app/components/FormPreviewField";
import { formatArtistTypeLabel } from "@/utils/artist";
import { nullIfEmpty } from "@/utils/common";
import { orPlaceholder } from "@/utils/form";

type ArtistUpsertFormPreviewProps = {
  form: ArtistUpsertFormDraft;
};

const ArtistUpsertFormPreview: FC<ArtistUpsertFormPreviewProps> = ({
  form,
}) => {
  const nameForSorting = nullIfEmpty(form.nameForSorting.value);

  return (
    <div className="flex flex-col gap-[0.45rem] text-[0.92em]">
      <FormPreviewField label="Name">{form.name.value}</FormPreviewField>
      <FormPreviewField label="Name used for sorting">
        {orPlaceholder(nameForSorting)}
      </FormPreviewField>
      <FormPreviewField label="Type">
        {formatArtistTypeLabel(form.type.value)}
      </FormPreviewField>
      <FormPreviewField label="Part of Queen family">
        {form.partOfQueenFamily.value ? "Yes" : "No"}
      </FormPreviewField>
      <FormPreviewBlockField label="Alternative names">
        {form.altNames.value.length === 0 ? (
          <p className="whitespace-pre-wrap">{orPlaceholder(null)}</p>
        ) : (
          <ul className="mt-[0.2rem] pl-[1.1rem]">
            {form.altNames.value.map((row) => (
              <li key={row.id}>{orPlaceholder(row.name)}</li>
            ))}
          </ul>
        )}
      </FormPreviewBlockField>
    </div>
  );
};

export default ArtistUpsertFormPreview;
