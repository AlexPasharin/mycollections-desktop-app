import { type FC, useState } from "react";

import Tags from "./Tags";

import DbSourceSelect from "@/app/components/DbSourceSelect";
import type { DbSource } from "@/db/db-source";
import { parseDbSource } from "@/db/parse-db-source";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSyncSearchParam } from "@/hooks/useSyncSearchParam";

const TagsWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);

  const [primaryDbSource, setPrimaryDbSource] = useState<DbSource>(
    parseDbSource(params.get("source")),
  );

  useSyncSearchParam("source", primaryDbSource);
  useDocumentTitle("Tags");

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <h1 className="m-0">Tags</h1>
        <DbSourceSelect
          id="tags-db-source"
          value={primaryDbSource}
          onChange={setPrimaryDbSource}
        />
      </header>

      <Tags primaryDbSource={primaryDbSource} />
    </div>
  );
};

export default TagsWindowWrapper;
