import type { FC } from "react";

import styles from "./AddReleaseFormFormatsSection.module.css";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { ReleasesFormatListItem } from "@/types/formats";

export type AddReleaseFormFormatInput = {
  formatId: string;
  amount: string;
  pictureSleeve: boolean;
  jukeboxHole: boolean;
};

type AddReleaseFormFormatsSectionProps = {
  row: AddReleaseFormFormatInput;
  releasesFormats: ReleasesFormatListItem[];
  formatSectionDisabled: boolean;
  onFormatChange: (formatId: string) => void;
  patchFormat: (patch: Partial<AddReleaseFormFormatInput>) => void;
};

const AddReleaseFormFormatsSection: FC<AddReleaseFormFormatsSectionProps> = ({
  row,
  releasesFormats,
  formatSectionDisabled,
  onFormatChange,
  patchFormat,
}) => {
  const selectedFormat = releasesFormats.find((f) => f.formatId === row.formatId);
  const showJukeboxHole =
    selectedFormat?.shortName === SEVEN_INCH_FORMAT_SHORT_NAME;

  return (
    <div
      className={styles.section}
      role="group"
      aria-labelledby="add-release-formats-heading"
    >
      <p id="add-release-formats-heading" className={styles.label}>
        Formats
      </p>

      <div className={styles.inlineRow}>
        <div className={styles.segment}>
          <label className={styles.label} htmlFor="add-release-format">
            Format
          </label>
          <select
            id="add-release-format"
            className={styles.input}
            value={row.formatId}
            onChange={(e) => onFormatChange(e.target.value)}
          >
            <option value="" />
            {releasesFormats.map((f) => (
              <option key={f.formatId} value={f.formatId}>
                {f.shortName}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.segmentAmount}>
          <label className={styles.label} htmlFor="add-release-format-amount">
            Amount
          </label>
          <input
            id="add-release-format-amount"
            className={styles.input}
            type="number"
            min={1}
            step={1}
            value={row.amount}
            disabled={formatSectionDisabled}
            onChange={(e) => patchFormat({ amount: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.checkboxesRow}>
        <div className={styles.checkboxRow}>
          <input
            id="add-release-picture-sleeve"
            type="checkbox"
            checked={row.pictureSleeve}
            disabled={formatSectionDisabled}
            onChange={(e) => patchFormat({ pictureSleeve: e.target.checked })}
          />
          <label
            className={styles.checkboxLabel}
            htmlFor="add-release-picture-sleeve"
          >
            Picture sleeve
          </label>
        </div>
        {showJukeboxHole && (
          <div className={styles.checkboxRow}>
            <input
              id="add-release-jukebox-hole"
              type="checkbox"
              checked={row.jukeboxHole}
              onChange={(e) => patchFormat({ jukeboxHole: e.target.checked })}
            />
            <label
              className={styles.checkboxLabel}
              htmlFor="add-release-jukebox-hole"
            >
              Jukebox hole
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddReleaseFormFormatsSection;
