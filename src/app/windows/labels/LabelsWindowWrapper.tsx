import { type FC, useState } from "react";

import Labels from "./Labels";

import DbSourceSelect from "@/app/components/DbSourceSelect";
import type { DbSource } from "@/db/db-source";
import { parseDbSource } from "@/db/parse-db-source";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSyncSearchParam } from "@/hooks/useSyncSearchParam";

const LabelsWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);

  const [primaryDbSource, setPrimaryDbSource] = useState<DbSource>(
    parseDbSource(params.get("source")),
  );

  useSyncSearchParam("source", primaryDbSource);
  useDocumentTitle("Labels");

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <h1 className="m-0">Labels</h1>
        <DbSourceSelect
          id="labels-db-source"
          value={primaryDbSource}
          onChange={setPrimaryDbSource}
        />
      </header>

      <Labels primaryDbSource={primaryDbSource} />
    </div>
  );
};

export default LabelsWindowWrapper;
