import { type FC, type ReactElement } from "react";

import styles from "./ReleaseFormatItem.module.css";

import { formatJson } from "../formatJson";

import type { ReleaseFormatOfReleaseItem } from "@/types/releases";

type ReleaseFormatItemProps = {
  format: ReleaseFormatOfReleaseItem;
};

const renderSpeed = (speed: unknown): string | ReactElement | null => {
  const text = formatJson(speed);

  if (text === null) {
    return null;
  }

  if (text.includes("\n")) {
    return <pre className={styles.speedPre}>{text}</pre>;
  }

  return text;
};

const ReleaseFormatItem: FC<ReleaseFormatItemProps> = ({ format }) => {
  const speedContent = renderSpeed(format.speed);

  const titleParts = [
    `${format.shortName}${format.amount > 1 ? `x${format.amount}` : ""}`,
  ];

  if (format.jukeboxHole) {
    titleParts.push("jukebox hole");
  }

  if (!format.pictureSleeve) {
    titleParts.push("no picture sleeve");
  }

  return (
    <li className={styles.root}>
      <p className={styles.title}>{titleParts.join(", ")}</p>
      {speedContent !== null && (
        <div className={styles.field}>
          <span className={styles.label}>Speed: </span>
          {speedContent}
        </div>
      )}
    </li>
  );
};

export default ReleaseFormatItem;
