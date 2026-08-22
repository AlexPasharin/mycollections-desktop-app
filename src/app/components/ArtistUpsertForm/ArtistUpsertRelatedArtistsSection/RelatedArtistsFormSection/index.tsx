import type { ArtistUpsertRelatedArtistRow } from "../../artistUpsertFormUtils/formValues";

import ErrorMessages from "@/app/components/ErrorMessages";
import NotificationMessages from "@/app/components/NotificationMessages";
import { CHILD_RELATION, PARENT_RELATION } from "@/constants";
import type { RelatedItemRelation } from "@/types/common";
import type { FeedbackNotifications, FormFieldError } from "@/types/form";

export type RelatedArtistsFormSectionLabels = {
  sectionTitle: string;
  listAriaLabel: string;
  relatedIdLabel: string;
  relatedIdPlaceholder: string;
  removeItemAriaLabel: (index: number) => string;
  addRowButtonLabel: string;
  notificationsId: string;
  rowIdPrefix: string;
};

type RelatedArtistsFormSectionProps = {
  rows: ArtistUpsertRelatedArtistRow[];
  getRelatedId: (row: ArtistUpsertRelatedArtistRow) => string;
  errors: Record<string, FormFieldError[]>;
  notifications: FeedbackNotifications;
  labels: RelatedArtistsFormSectionLabels;
  onChangeRelatedId: (rowId: string, relatedId: string) => void;
  onChangeRelation: (rowId: string, relation: RelatedItemRelation) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string) => void;
  onBlur: () => void;
};

const relatedArtistsGridClassName =
  "grid w-fit max-w-full grid-cols-[32ch_6rem_1rem_1.85rem] items-center gap-x-3";

const RelatedArtistsFormSection = ({
  rows,
  getRelatedId,
  errors,
  notifications,
  labels,
  onChangeRelatedId,
  onChangeRelation,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
}: RelatedArtistsFormSectionProps) => (
  <div className="mt-0 mb-[0.65rem]">
    <h2 className="mb-3 text-base leading-snug font-semibold">
      {labels.sectionTitle}
    </h2>

    {rows.length > 0 && (
      <div
        className={`${relatedArtistsGridClassName} mb-3 gap-y-[0.55rem]`}
        role="list"
        aria-label={labels.listAriaLabel}
      >
        <span className="text-[0.92em] font-semibold" aria-hidden="true">
          {labels.relatedIdLabel}
        </span>
        <span className="text-[0.92em] font-semibold" aria-hidden="true">
          Relation
        </span>
        <span aria-hidden="true" />
        <span aria-hidden="true" />

        {rows.map((row, index) => {
          const rowErrors = errors[row.id];
          const hasErrors = rowErrors !== undefined && rowErrors.length > 0;
          const errorId = `${labels.rowIdPrefix}-error-${row.id}`;
          const relatedIdInputId = `${labels.rowIdPrefix}-id-${row.id}`;
          const relationSelectId = `${labels.rowIdPrefix}-relation-${row.id}`;
          const removeAriaLabel = labels.removeItemAriaLabel(index);
          const rowLabelSuffix = ` ${index + 1}`;

          return (
            <div
              key={row.id}
              className="col-span-4 grid grid-cols-subgrid gap-y-2"
              role="listitem"
            >
              <input
                id={relatedIdInputId}
                className="w-full max-w-full min-w-0 px-2 py-[0.35rem] text-base"
                type="text"
                value={getRelatedId(row)}
                placeholder={labels.relatedIdPlaceholder}
                aria-label={`${labels.relatedIdLabel}${rowLabelSuffix}`}
                onChange={(e) => {
                  onChangeRelatedId(row.id, e.target.value);
                }}
                onFocus={() => {
                  onFocus(row.id);
                }}
                onBlur={onBlur}
                autoComplete="off"
                spellCheck={false}
              />
              <select
                id={relationSelectId}
                className="w-full px-2 py-[0.35rem] text-base"
                value={row.relation}
                aria-label={`Relation${rowLabelSuffix}`}
                onChange={(e) => {
                  onChangeRelation(
                    row.id,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                    e.target.value as RelatedItemRelation, // we know that this is safe by construction
                  );
                }}
                onFocus={() => {
                  onFocus(row.id);
                }}
                onBlur={onBlur}
                aria-invalid={hasErrors}
                aria-describedby={hasErrors ? errorId : undefined}
              >
                <option value=""></option>
                <option value={PARENT_RELATION}>Parent</option>
                <option value={CHILD_RELATION}>Child</option>
              </select>
              <button
                type="button"
                className="col-start-4 inline-flex h-[1.85rem] shrink-0 cursor-pointer items-center justify-center rounded-[0.2rem] border-none bg-transparent p-0 text-[1.05rem] leading-none text-[#a40000] hover:bg-[rgba(164,0,0,0.08)] hover:text-[#7a0000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1a5fb4]"
                aria-label={removeAriaLabel}
                title={removeAriaLabel}
                onClick={() => {
                  onRemoveRow(row.id);
                }}
              >
                <span aria-hidden="true">❌</span>
              </button>
              {hasErrors && (
                <div className="col-span-4">
                  <ErrorMessages id={errorId} messages={rowErrors} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}

    <NotificationMessages
      id={labels.notificationsId}
      messages={notifications}
    />

    <button
      type="button"
      className="inline-block cursor-pointer border-none bg-transparent px-0 py-1 text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
      onClick={onAddRow}
    >
      {labels.addRowButtonLabel}
    </button>
  </div>
);

export default RelatedArtistsFormSection;
