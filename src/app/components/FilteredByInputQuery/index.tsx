import { type ReactNode, useState } from "react";

export type FilteredByInputQueryProps<T> = {
  items: readonly T[];
  matchesFilter: (item: T, trimmedQuery: string) => boolean;
  inputId: string;
  inputLabel: string;
  inputPlaceholder?: string;
  noMatchesMessage: string;
  children: (filteredItems: readonly T[]) => ReactNode;
};

const FilteredByInputQuery = <T,>({
  items,
  matchesFilter,
  inputId,
  inputLabel,
  inputPlaceholder = "Filter by name…",
  noMatchesMessage,
  children,
}: FilteredByInputQueryProps<T>) => {
  const [filterQuery, setFilterQuery] = useState("");

  const trimmedFilterQuery = filterQuery.trim();

  const filteredItems =
    trimmedFilterQuery === ""
      ? items
      : items.filter((item) => matchesFilter(item, trimmedFilterQuery));

  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="mb-2 font-medium">
          {inputLabel}
        </label>
        <input
          id={inputId}
          type="text"
          value={filterQuery}
          onChange={(event) => setFilterQuery(event.target.value)}
          placeholder={inputPlaceholder}
          className="max-w-md rounded border border-gray-300 px-2 py-1"
        />
      </div>

      {trimmedFilterQuery !== "" && filteredItems.length === 0 && (
        <p className="p-4">{noMatchesMessage}</p>
      )}

      {filteredItems.length > 0 && children(filteredItems)}
    </>
  );
};

export default FilteredByInputQuery;
