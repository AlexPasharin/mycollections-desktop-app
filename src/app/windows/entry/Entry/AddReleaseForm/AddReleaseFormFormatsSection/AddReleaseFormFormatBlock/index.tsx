import type { FC } from "react";

import styles from "./AddReleaseFormFormatBlock.module.css";

import type { AddReleaseFormFormatInput } from "../index";

import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { ReleasesFormatListItem } from "@/types/formats";

type AddReleaseFormFormatBlockProps = {
  row: AddReleaseFormFormatInput;
  rowIndex: number;
  releasesFormats: ReleasesFormatListItem[];
  onFormatChange: (formatId: string) => void;
  patchFormat: (patch: Partial<AddReleaseFormFormatInput>) => void;
};

const AddReleaseFormFormatBlock: FC<AddReleaseFormFormatBlockProps> = ({
  row,
  rowIndex,
  releasesFormats,
  onFormatChange,
  patchFormat,
}) => {
  const selectedFormat = releasesFormats.find(
    (f) => f.formatId === row.formatId,
  );
  const showJukeboxHole =
    selectedFormat?.shortName === SEVEN_INCH_FORMAT_SHORT_NAME;
  const formatSectionDisabled = !row.formatId;
  const suffix = `-${rowIndex}`;

  return (
    <div role="group" aria-label={`Format ${rowIndex + 1}`}>
      <div className={styles.inlineRow}>
        <div className={styles.segment}>
          <label
            className={styles.label}
            htmlFor={`add-release-format${suffix}`}
          >
            Format
          </label>
          <select
            id={`add-release-format${suffix}`}
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
          <label
            className={styles.label}
            htmlFor={`add-release-format-amount${suffix}`}
          >
            Amount
          </label>
          <input
            id={`add-release-format-amount${suffix}`}
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
            id={`add-release-picture-sleeve${suffix}`}
            type="checkbox"
            checked={row.pictureSleeve}
            disabled={formatSectionDisabled}
            onChange={(e) => patchFormat({ pictureSleeve: e.target.checked })}
          />
          <label
            className={styles.checkboxLabel}
            htmlFor={`add-release-picture-sleeve${suffix}`}
          >
            Picture sleeve
          </label>
        </div>
        {showJukeboxHole && (
          <div className={styles.checkboxRow}>
            <input
              id={`add-release-jukebox-hole${suffix}`}
              type="checkbox"
              checked={row.jukeboxHole}
              onChange={(e) => patchFormat({ jukeboxHole: e.target.checked })}
            />
            <label
              className={styles.checkboxLabel}
              htmlFor={`add-release-jukebox-hole${suffix}`}
            >
              Jukebox hole
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddReleaseFormFormatBlock;
