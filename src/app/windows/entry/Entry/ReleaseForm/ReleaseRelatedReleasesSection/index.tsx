import type { FC } from "react";

import type { ReleaseFormRelatedReleasesErrors } from "../releaseFormUtils/errorMessages";
import type {
  ReleaseFormRelatedReleaseRelation,
  ReleaseFormRelatedReleaseRow,
} from "../releaseFormUtils/formValues";

import ErrorMessages from "@/app/components/ErrorMessages";

type ReleaseRelatedReleasesSectionProps = {
  relatedReleases: ReleaseFormRelatedReleaseRow[];
  errors: ReleaseFormRelatedReleasesErrors;
  onChangeReleaseId: (rowId: string, releaseId: string) => void;
  onChangeRelation: (
    rowId: string,
    relation: ReleaseFormRelatedReleaseRelation | "",
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string) => void;
  onBlur: () => void;
};

const ReleaseRelatedReleasesSection: FC<ReleaseRelatedReleasesSectionProps> = ({
  relatedReleases,
  errors,
  onChangeReleaseId,
  onChangeRelation,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
}) => (
  <div className="mt-0 mb-[0.65rem]">
    <h2 className="mb-3 text-base leading-snug font-semibold">
      Related releases
    </h2>

    {relatedReleases.length > 0 && (
      <ul
        className="mb-3 flex list-none flex-col gap-[0.55rem] p-0"
        aria-label="Related releases"
      >
        {relatedReleases.map((row, index) => {
          const rowErrors = errors[row.id];
          const hasErrors = rowErrors !== undefined && rowErrors.length > 0;
          const errorId = `add-release-related-release-error-${row.id}`;
          const releaseIdInputId = `add-release-related-release-id-${row.id}`;
          const relationSelectId = `add-release-related-release-relation-${row.id}`;
          const removeAriaLabel = `Remove related release ${index + 1}`;

          return (
            <li key={row.id}>
              <div className="flex items-center gap-4">
                <span className="text-[0.92em] font-semibold">
                  Related {index + 1}
                </span>
                <label className="sr-only" htmlFor={releaseIdInputId}>
                  Release ID {index + 1}
                </label>
                <input
                  id={releaseIdInputId}
                  className="px-2 py-[0.35rem] text-base"
                  type="text"
                  size={36}
                  value={row.releaseId}
                  placeholder="Release ID"
                  onChange={(e) => {
                    onChangeReleaseId(row.id, e.target.value);
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
                      parseRelationSelectValue(e.target.value),
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
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
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

    <button
      type="button"
      className="inline-block cursor-pointer border-none bg-transparent px-0 py-1 text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
      onClick={onAddRow}
    >
      Add related release
    </button>
  </div>
);

export default ReleaseRelatedReleasesSection;

const parseRelationSelectValue = (
  value: string,
): ReleaseFormRelatedReleaseRelation | "" => {
  if (value === "parent" || value === "child") {
    return value;
  }

  return "";
};
