import { Fragment, type FC } from "react";

import FeedbackSection2 from "../../FeedbackSection2";
import type { ArtistUpsertRelatedArtistRow } from "../artistUpsertFormUtils/formValues";

import { CHILD_RELATION, PARENT_RELATION } from "@/constants";
import type { FormFeedbackMessages } from "@/hooks/useFormState";
import type { RelatedItemRelation } from "@/types/common";

type ArtistUpsertRelatedArtistsSectionProps = {
  relatedArtists: ArtistUpsertRelatedArtistRow[];
  errors: FormFeedbackMessages;
  notifications: FormFeedbackMessages;
  onChangeArtistId: (rowId: string, artistId: string) => void;
  onChangeRelation: (rowId: string, relation: RelatedItemRelation | "") => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string, field: "artistId" | "relation") => void;
  onBlur: () => void;
};

const relatedArtistsGridClassName =
  "grid w-fit max-w-full grid-cols-[32ch_6rem_1rem_1.85rem] items-center gap-x-3";

const ArtistUpsertRelatedArtistsSection: FC<
  ArtistUpsertRelatedArtistsSectionProps
> = ({
  relatedArtists,
  errors,
  notifications,
  onChangeArtistId,
  onChangeRelation,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
}) => (
  <div className="mt-0 mb-[0.65rem]">
    <h2 className="mb-3 text-base leading-snug font-semibold">
      {labels.sectionTitle}
    </h2>

    {relatedArtists.length > 0 && (
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

        {relatedArtists.map((relatedArtist, index) => {
          const rowErrors = errors.filter((error) =>
            error.sources?.some((source) =>
              String(source).startsWith(relatedArtist.id),
            ),
          );
          const rowNotifications = notifications.filter((notification) =>
            notification.sources?.some((source) =>
              String(source).startsWith(relatedArtist.id),
            ),
          );

          const rowId = relatedArtist.id;

          const hasErrors = rowErrors.length > 0;
          const errorsId = `${labels.rowIdPrefix}-error-${rowId}`;
          const notificationsId = `${labels.rowIdPrefix}-notification-${rowId}`;
          const relatedIdInputId = `${labels.rowIdPrefix}-id-${rowId}`;
          const relationSelectId = `${labels.rowIdPrefix}-relation-${rowId}`;
          const removeAriaLabel = labels.removeItemAriaLabel(index);
          const rowLabelSuffix = ` ${index + 1}`;

          return (
            <Fragment key={rowId}>
              <div
                key={rowId}
                className="col-span-4 grid grid-cols-subgrid gap-y-2"
                role="listitem"
              >
                <input
                  id={relatedIdInputId}
                  className="w-full max-w-full min-w-0 px-2 py-[0.35rem] text-base"
                  type="text"
                  value={relatedArtist.artistId}
                  placeholder={labels.relatedIdPlaceholder}
                  aria-label={`${labels.relatedIdLabel}${rowLabelSuffix}`}
                  onChange={(e) => {
                    onChangeArtistId(rowId, e.target.value);
                  }}
                  onFocus={() => {
                    onFocus(rowId, "artistId");
                  }}
                  onBlur={onBlur}
                  autoComplete="off"
                  spellCheck={false}
                />
                <select
                  id={relationSelectId}
                  className="w-full px-2 py-[0.35rem] text-base"
                  value={relatedArtist.relation}
                  aria-label={`Relation${rowLabelSuffix}`}
                  onChange={(e) => {
                    onChangeRelation(
                      rowId,
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
                      e.target.value as RelatedItemRelation, // we know that this is safe by construction
                    );
                  }}
                  onFocus={() => {
                    onFocus(rowId, "relation");
                  }}
                  onBlur={onBlur}
                  aria-invalid={hasErrors}
                  aria-describedby={hasErrors ? errorsId : undefined}
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
                    onRemoveRow(rowId);
                  }}
                >
                  <span aria-hidden="true">❌</span>
                </button>
              </div>
              <div className="col-span-4">
                <FeedbackSection2
                  notificationsId={notificationsId}
                  errorsId={errorsId}
                  errors={rowErrors}
                  notifications={rowNotifications}
                />
              </div>
            </Fragment>
          );
        })}
      </div>
    )}

    <button
      type="button"
      className="inline-block cursor-pointer border-none bg-transparent px-0 py-1 text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
      onClick={onAddRow}
    >
      {labels.addRowButtonLabel}
    </button>
  </div>
);

export default ArtistUpsertRelatedArtistsSection;

const labels = {
  sectionTitle: "Related artists",
  listAriaLabel: "Related parent or child artists",
  relatedIdLabel: "Artist ID",
  relatedIdPlaceholder: "Artist ID",
  removeItemAriaLabel: (index: number) => `Remove related artist ${index + 1}`,
  addRowButtonLabel: "Add related artist",
  notificationsId: "upsert-artist-related-artists-notifications",
  rowIdPrefix: "upsert-artist-related-artist",
};
