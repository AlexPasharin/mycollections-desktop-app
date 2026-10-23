import type { FC } from "react";

import { type ValidatedArtistUpsertFormDraft } from "../artistUpsertFormUtils/formValues";

import FormPreviewField, {
  FormPreviewBlockField,
} from "@/app/components/Form/FormPreviewField";
import { formatArtistTypeLabel } from "@/utils/artist";
import { nullIfEmpty } from "@/utils/common";
import { orPlaceholder } from "@/utils/form";

type ArtistUpsertFormPreviewProps = {
  form: ValidatedArtistUpsertFormDraft;
};

const ArtistUpsertFormPreview: FC<ArtistUpsertFormPreviewProps> = ({
  form,
}) => {
  const nameForSorting = nullIfEmpty(form.nameForSorting);

  return (
    <div className="flex flex-col gap-[0.45rem] text-[0.92em]">
      <FormPreviewField label="Name">{form.name}</FormPreviewField>
      <FormPreviewField label="Name used for sorting">
        {orPlaceholder(nameForSorting)}
      </FormPreviewField>
      <FormPreviewField label="Type">
        {formatArtistTypeLabel(form.type)}
      </FormPreviewField>
      <FormPreviewField label="Part of Queen family">
        {form.partOfQueenFamily ? "Yes" : "No"}
      </FormPreviewField>
      <FormPreviewBlockField label="Alternative names">
        {form.altNames.length === 0 ? (
          <p className="whitespace-pre-wrap">{orPlaceholder(null)}</p>
        ) : (
          <ul className="mt-[0.2rem] pl-[1.1rem]">
            {form.altNames.map((row) => (
              <li key={row.id}>{orPlaceholder(row.name)}</li>
            ))}
          </ul>
        )}
      </FormPreviewBlockField>
      <FormPreviewBlockField label="Related artists">
        {form.relatedParents.length === 0 ? (
          <p className="whitespace-pre-wrap">{orPlaceholder(null)}</p>
        ) : (
          <ul className="mt-[0.2rem] pl-[1.1rem]">
            {form.relatedParents.map((row) => (
              <li key={row.id}>
                {orPlaceholder(row.artistId.trim())} — {row.relation}
              </li>
            ))}
          </ul>
        )}
      </FormPreviewBlockField>
    </div>
  );
};

export default ArtistUpsertFormPreview;
