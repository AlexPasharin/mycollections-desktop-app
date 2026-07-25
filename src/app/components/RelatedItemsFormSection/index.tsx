import ErrorMessages from "@/app/components/ErrorMessages";
import NotificationMessages from "@/app/components/NotificationMessages";
import { CHILD_RELATION, PARENT_RELATION } from "@/constants";
import type {
  FeedbackNotifications,
  FormFieldError,
  FormRelatedItemRelation,
  RelatedItemRow,
} from "@/types/form";

export type RelatedItemsFormSectionLabels = {
  sectionTitle: string;
  listAriaLabel: string;
  relatedIdLabel: string;
  relatedIdPlaceholder: string;
  removeItemAriaLabel: (index: number) => string;
  addRowButtonLabel: string;
  notificationsId: string;
  rowIdPrefix: string;
};

type RelatedItemsFormSectionProps<TRow extends RelatedItemRow> = {
  rows: TRow[];
  getRelatedId: (row: TRow) => string;
  errors: Record<string, FormFieldError[]>;
  notifications: FeedbackNotifications;
  labels: RelatedItemsFormSectionLabels;
  onChangeRelatedId: (rowId: string, relatedId: string) => void;
  onChangeRelation: (rowId: string, relation: FormRelatedItemRelation) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string) => void;
  onBlur: () => void;
};

const RelatedItemsFormSection = <TRow extends RelatedItemRow>({
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
}: RelatedItemsFormSectionProps<TRow>) => (
  <div className="mt-0 mb-[0.65rem]">
    <h2 className="mb-3 text-base leading-snug font-semibold">
      {labels.sectionTitle}
    </h2>

    {rows.length > 0 && (
      <ul
        className="mb-3 flex list-none flex-col gap-[0.55rem] p-0"
        aria-label={labels.listAriaLabel}
      >
        {rows.map((row, index) => {
          const rowErrors = errors[row.id];
          const hasErrors = rowErrors !== undefined && rowErrors.length > 0;
          const errorId = `${labels.rowIdPrefix}-error-${row.id}`;
          const relatedIdInputId = `${labels.rowIdPrefix}-id-${row.id}`;
          const relationSelectId = `${labels.rowIdPrefix}-relation-${row.id}`;
          const removeAriaLabel = labels.removeItemAriaLabel(index);

          return (
            <li key={row.id}>
              <div className="flex items-center gap-4">
                <span className="text-[0.92em] font-semibold">
                  Related {index + 1}
                </span>
                <label className="sr-only" htmlFor={relatedIdInputId}>
                  {labels.relatedIdLabel} {index + 1}
                </label>
                <input
                  id={relatedIdInputId}
                  className="px-2 py-[0.35rem] text-base"
                  type="text"
                  size={36}
                  value={getRelatedId(row)}
                  placeholder={labels.relatedIdPlaceholder}
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
                <label className="sr-only" htmlFor={relationSelectId}>
                  Relation {index + 1}
                </label>
                <select
                  id={relationSelectId}
                  className="px-2 py-[0.35rem] text-base"
                  value={row.relation}
                  onChange={(e) => {
                    onChangeRelation(
                      row.id,
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                      e.target.value as FormRelatedItemRelation, // we know that this is safe by construction
                    );
                  }}
                  onFocus={() => {
                    onFocus(row.id);
                  }}
                  onBlur={onBlur}
                  aria-invalid={hasErrors}
                  aria-describedby={hasErrors ? errorId : undefined}
                >
                  <option value="">Relation…</option>
                  <option value={PARENT_RELATION}>Parent</option>
                  <option value={CHILD_RELATION}>Child</option>
                </select>
                <button
                  type="button"
                  className="inline-flex h-[1.85rem] shrink-0 cursor-pointer items-center justify-center rounded-[0.2rem] border-none bg-transparent p-0 text-[1.05rem] leading-none text-[#a40000] hover:bg-[rgba(164,0,0,0.08)] hover:text-[#7a0000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1a5fb4]"
                  aria-label={removeAriaLabel}
                  title={removeAriaLabel}
                  onClick={() => {
                    onRemoveRow(row.id);
                  }}
                >
                  <span aria-hidden="true">❌</span>
                </button>
              </div>
              {hasErrors && (
                <div className="mt-2">
                  <ErrorMessages id={errorId} messages={rowErrors} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
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

export default RelatedItemsFormSection;
