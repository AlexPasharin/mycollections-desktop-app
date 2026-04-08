import type { FC } from "react";

import AddReleaseFormFormatBlock from "./AddReleaseFormFormatBlock";
import styles from "./AddReleaseFormFormatsSection.module.css";

import type { ReleasesFormatListItem } from "@/types/formats";

export type AddReleaseFormFormatInput = {
  formatId: string;
  amount: string;
  pictureSleeve: boolean;
  jukeboxHole: boolean;
};

type AddReleaseFormFormatsSectionProps = {
  formats: AddReleaseFormFormatInput[];
  releasesFormats: ReleasesFormatListItem[];
  onFormatChange: (rowIndex: number, formatId: string) => void;
  patchFormat: (
    rowIndex: number,
    patch: Partial<AddReleaseFormFormatInput>,
  ) => void;
  onAddFormat: () => void;
  onRemoveFormat: (rowIndex: number) => void;
};

const AddReleaseFormFormatsSection: FC<AddReleaseFormFormatsSectionProps> = ({
  formats,
  releasesFormats,
  onFormatChange,
  patchFormat,
  onAddFormat,
  onRemoveFormat,
}) => {
  return (
    <div
      className={styles.section}
      role="group"
      aria-labelledby="add-release-formats-heading"
    >
      <p id="add-release-formats-heading" className={styles.heading}>
        Formats
      </p>

      {formats.map((row, rowIndex) => (
        <div key={rowIndex}>
          {rowIndex > 0 && <hr className={styles.divider} aria-hidden />}
          <div
            className={
              rowIndex === 0
                ? `${styles.formatBlock} ${styles.formatBlockFirst}`
                : styles.formatBlock
            }
          >
            <AddReleaseFormFormatBlock
              row={row}
              rowIndex={rowIndex}
              releasesFormats={releasesFormats}
              onFormatChange={(formatId) => onFormatChange(rowIndex, formatId)}
              patchFormat={(patch) => patchFormat(rowIndex, patch)}
              onRemoveFormat={rowIndex > 0 ? () => onRemoveFormat(rowIndex) : undefined}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        id="add-release-add-another-format"
        className={styles.addAnotherFormat}
        onClick={onAddFormat}
      >
        + Add another format
      </button>
    </div>
  );
};

export default AddReleaseFormFormatsSection;
