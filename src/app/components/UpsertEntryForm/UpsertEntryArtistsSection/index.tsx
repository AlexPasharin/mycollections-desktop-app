import type { FC } from "react";

import type {
  UpsertEntryArtistFieldSource,
  UpsertEntryArtistsErrors,
} from "../upsertEntryFormUtils/errorMessages";
import type { UpsertEntryArtistRow } from "../upsertEntryFormUtils/formValues";

import ErrorMessages from "@/app/components/ErrorMessages";
import NotificationMessages from "@/app/components/NotificationMessages";
import type { FeedbackNotifications } from "@/types/form";

type UpsertEntryArtistRowPatch = Partial<Omit<UpsertEntryArtistRow, "id">>;

type UpsertEntryArtistsSectionProps = {
  artists: UpsertEntryArtistRow[];
  errors: UpsertEntryArtistsErrors;
  notifications: FeedbackNotifications;
  onUpdateArtistRow: (rowId: string, patch: UpsertEntryArtistRowPatch) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string, source: UpsertEntryArtistFieldSource) => void;
  onBlur: () => void;
};

const fieldLabelClassName =
  "basis-1/5 pt-[0.35rem] text-[0.92em] font-semibold";

const uuidInputClassName = "px-2 py-[0.35rem] text-base";

const UpsertEntryArtistsSection: FC<UpsertEntryArtistsSectionProps> = ({
  artists,
  errors,
  notifications,
  onUpdateArtistRow,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
}) => (
  <div className="mt-0 mb-[0.65rem]">
    <h2 className="mb-3 text-base leading-snug font-semibold">Artists</h2>

    {artists.length > 0 && (
      <ul
        className="mb-3 flex list-none flex-col gap-[0.65rem] p-0"
        aria-label="Artists"
      >
        {artists.map((row, index) => {
          const rowErrors = errors[row.id];
          const hasErrors = rowErrors !== undefined && rowErrors.length > 0;
          const errorId = `upsert-entry-artist-error-${row.id}`;
          const artistIdInputId = `upsert-entry-artist-id-${row.id}`;
          const altNameIdInputId = `upsert-entry-artist-alt-name-id-${row.id}`;
          const mainCheckboxId = `upsert-entry-artist-main-${row.id}`;
          const removeAriaLabel = `Remove artist ${index + 1}`;

          return (
            <li
              key={row.id}
              className="flex list-none flex-col gap-[0.55rem] rounded-lg border border-black/15 bg-[#fafafa] px-3 py-2.5"
            >
              <div className="flex flex-wrap items-start gap-2">
                <label
                  className={fieldLabelClassName}
                  htmlFor={artistIdInputId}
                >
                  Artist ID
                </label>
                <input
                  id={artistIdInputId}
                  className={uuidInputClassName}
                  type="text"
                  size={38}
                  value={row.artistId}
                  placeholder="Artist ID"
                  onChange={(e) => {
                    onUpdateArtistRow(row.id, { artistId: e.target.value });
                  }}
                  onFocus={() => {
                    onFocus(row.id, "artistId");
                  }}
                  onBlur={onBlur}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={hasErrors}
                  aria-describedby={hasErrors ? errorId : undefined}
                />
                <div className="flex items-center gap-1">
                  <input
                    id={mainCheckboxId}
                    type="checkbox"
                    checked={row.isEntriesMainArtist}
                    onChange={(e) => {
                      onUpdateArtistRow(row.id, {
                        isEntriesMainArtist: e.target.checked,
                      });
                    }}
                    onFocus={() => {
                      onFocus(row.id, "isEntriesMainArtist");
                    }}
                    onBlur={onBlur}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? errorId : undefined}
                  />
                  <label
                    className="text-[0.92em] font-semibold"
                    htmlFor={mainCheckboxId}
                  >
                    Main
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label
                  className={fieldLabelClassName}
                  htmlFor={altNameIdInputId}
                >
                  Alt name ID
                </label>
                <input
                  id={altNameIdInputId}
                  className={uuidInputClassName}
                  type="text"
                  size={38}
                  value={row.entryArtistAltNameId}
                  placeholder="Alt name ID (optional)"
                  onChange={(e) => {
                    onUpdateArtistRow(row.id, {
                      entryArtistAltNameId: e.target.value,
                    });
                  }}
                  onFocus={() => {
                    onFocus(row.id, "entryArtistAltNameId");
                  }}
                  onBlur={onBlur}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={hasErrors}
                  aria-describedby={hasErrors ? errorId : undefined}
                />
              </div>

              {hasErrors && <ErrorMessages id={errorId} messages={rowErrors} />}

              <button
                type="button"
                className="cursor-pointer self-start border-none bg-transparent px-0 py-1 text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
                aria-label={removeAriaLabel}
                onClick={() => {
                  onRemoveRow(row.id);
                }}
              >
                Remove artist
              </button>
            </li>
          );
        })}
      </ul>
    )}

    <NotificationMessages
      id="upsert-entry-artists-notifications"
      messages={notifications}
    />

    <button
      type="button"
      className="inline-block cursor-pointer border-none bg-transparent px-0 py-1 text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
      onClick={onAddRow}
    >
      Add artist
    </button>
  </div>
);

export default UpsertEntryArtistsSection;
