import { type FC, type ReactElement } from "react";

import type { ReleaseFormatOfReleaseItem } from "@/types/releases";
import { formatJson } from "@/utils/common";

type ReleaseFormatItemProps = {
  format: ReleaseFormatOfReleaseItem;
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
    <li className="mb-[0.55rem] rounded bg-[#f5f5f5] p-[0.45rem_0.55rem] last:mb-0">
      <p className="m-0 mb-[0.35rem] font-semibold">{titleParts.join(", ")}</p>
      {speedContent !== null && (
        <div className="m-0 mb-[0.45rem]">
          <span className="font-semibold">Speed: </span>
          {speedContent}
        </div>
      )}
    </li>
  );
};

export default ReleaseFormatItem;

const renderSpeed = (speed: unknown): string | ReactElement | null => {
  const text = formatJson(speed);

  if (text === null) {
    return null;
  }

  if (text.includes("\n")) {
    return (
      <pre className="mt-1 block overflow-x-auto rounded-[3px] bg-white p-[0.35rem_0.45rem] text-[0.8rem] leading-[1.35] break-words whitespace-pre-wrap">
        {text}
      </pre>
    );
  }

  return text;
};
