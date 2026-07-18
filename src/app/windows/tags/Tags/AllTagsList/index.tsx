import { type FC, useEffect, useState } from "react";

import api from "../../api";

import FilteredByInputQuery from "@/app/components/FilteredByInputQuery";
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
    <FilteredByInputQuery
      key={primaryDbSource}
      items={tags}
      matchesFilter={({ tag }, trimmedQuery) =>
        matchesTrimmedCaseInsensitiveSubstring(tag, trimmedQuery)
      }
      inputId="tags-name-filter"
      inputLabel="Find tag"
      noMatchesMessage="No tags match your filter."
    >
      {(filteredTags) => (
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
    </FilteredByInputQuery>
  );
};

export default AllTagsList;
