import { type FC, useEffect, useState } from "react";

import api from "../../api";

import type { DbSource } from "@/db/db-source";
import type { LabelListItem } from "@/types/labels";

type AllLabelsListProps = {
  primaryDbSource: DbSource;
  labels: LabelListItem[];
  onLabelsChange: (labels: LabelListItem[]) => void;
  recentlyAddedLabel?: LabelListItem | undefined;
};

const recentlyAddedBadgeClassName =
  "ml-2 inline-block rounded-full border border-[#6ee7b7] bg-[#d1fae5] px-[0.45rem] py-[0.05rem] align-middle text-[0.75em] font-semibold leading-[1.35] text-[#14532d]";

const AllLabelsList: FC<AllLabelsListProps> = ({
  primaryDbSource,
  labels,
  onLabelsChange,
  recentlyAddedLabel,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<unknown>(null);

  useEffect(() => {
    setIsLoading(true);
    setLoadingError(null);

    api
      .fetchLabels(primaryDbSource)
      .then(onLabelsChange)
      .catch((error: unknown) => {
        console.error("Error fetching labels", error);
        onLabelsChange([]);
        setLoadingError(error);
      })
      .finally(() => setIsLoading(false));
  }, [primaryDbSource, onLabelsChange]);

  if (isLoading) {
    return <p>Loading labels...</p>;
  }

  if (loadingError) {
    return (
      <p role="alert">
        Loading failed:{" "}
        {loadingError instanceof Error
          ? loadingError.message
          : "Could not load labels"}
      </p>
    );
  }

  if (labels.length === 0) {
    return <p>No labels found.</p>;
  }

  return (
    <ol className="flex flex-col gap-2 p-4">
      {labels.map(({ labelId, name }) => (
        <li key={labelId} className="font-semibold">
          {name}
          {recentlyAddedLabel?.labelId === labelId && (
            <span className={recentlyAddedBadgeClassName}>Recently added</span>
          )}
        </li>
      ))}
    </ol>
  );
};

export default AllLabelsList;
