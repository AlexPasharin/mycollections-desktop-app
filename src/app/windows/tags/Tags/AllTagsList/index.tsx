import { type FC, useEffect, useState } from "react";

import api from "../../api";

import type { DbSource } from "@/db/db-source";
import type { TagListItem } from "@/types/tags";
import { matchesTrimmedCaseInsensitiveSubstring } from "@/utils/common";

type AllTagsListProps = {
  primaryDbSource: DbSource;
  tags: TagListItem[];
  onTagsChange: (tags: TagListItem[]) => void;
  recentlyAddedTag?: TagListItem | undefined;
};

const recentlyAddedBadgeClassName =
  "ml-2 inline-block rounded-full border border-[#6ee7b7] bg-[#d1fae5] px-[0.45rem] py-[0.05rem] align-middle text-[0.75em] font-semibold leading-[1.35] text-[#14532d]";

const AllTagsList: FC<AllTagsListProps> = ({
  primaryDbSource,
  tags,
  onTagsChange,
  recentlyAddedTag,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<unknown>(null);
  const [nameFilterQuery, setNameFilterQuery] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setLoadingError(null);

    api
      .fetchTags(primaryDbSource)
      .then(onTagsChange)
      .catch((error: unknown) => {
        console.error("Error fetching tags", error);
        onTagsChange([]);
        setLoadingError(error);
      })
      .finally(() => setIsLoading(false));
  }, [primaryDbSource, onTagsChange]);

  useEffect(() => {
    setNameFilterQuery("");
  }, [primaryDbSource]);

  const trimmedNameFilterQuery = nameFilterQuery.trim();

  const filteredTags =
    trimmedNameFilterQuery === ""
      ? tags
      : tags.filter(({ tag }) =>
          matchesTrimmedCaseInsensitiveSubstring(tag, trimmedNameFilterQuery),
        );

  if (isLoading) {
    return <p>Loading tags...</p>;
  }

  if (loadingError) {
    return (
      <p role="alert">
        Loading failed:{" "}
        {loadingError instanceof Error
          ? loadingError.message
          : "Could not load tags"}
      </p>
    );
  }

  if (tags.length === 0) {
    return <p>No tags found.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-1 px-4 pt-4">
        <label htmlFor="tags-name-filter" className="font-medium">
          Find tag
        </label>
        <input
          id="tags-name-filter"
          type="text"
          value={nameFilterQuery}
          onChange={(event) => setNameFilterQuery(event.target.value)}
          placeholder="Filter by name…"
          className="max-w-md rounded border border-gray-300 px-2 py-1"
        />
      </div>

      {trimmedNameFilterQuery !== "" && filteredTags.length === 0 && (
        <p className="p-4">No tags match your filter.</p>
      )}

      {filteredTags.length > 0 && (
        <ol className="flex flex-col gap-2 p-4">
          {filteredTags.map(({ tagId, tag }) => (
            <li key={tagId} className="font-semibold">
              {tag}
              {recentlyAddedTag?.tagId === tagId && (
                <span className={recentlyAddedBadgeClassName}>
                  Recently added
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
};

export default AllTagsList;
