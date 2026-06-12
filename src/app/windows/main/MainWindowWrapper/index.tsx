import { useState, type FC } from "react";

import AllArtistsList from "./AllArtistsList";
import ArtistQuery from "./ArtistQuery";

import DbSourceSelect from "@/app/components/DbSourceSelect";
import Tabs from "@/app/components/Tabs";
import { DEFAULT_DB_SOURCE, type DbSource } from "@/db/db-source";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type MainTab = "query" | "list";

/** Stable ids for this tablist (single Main window view per document). */
const QUERY_TAB_ID = "main-query-tab";
const QUERY_PANEL_ID = "main-query-panel";
const LIST_TAB_ID = "main-list-tab";
const LIST_PANEL_ID = "main-list-panel";

const MainWindowWrapper: FC = () => {
  useDocumentTitle("My Collections - Main Window");

  const [activeTab, setActiveTab] = useState<MainTab>("query");
  const [dbSource, setDbSource] = useState<DbSource>(DEFAULT_DB_SOURCE);

  return (
    <>
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <h1 className="m-0">My Collections</h1>

        <DbSourceSelect
          id="main-db-source"
          value={dbSource}
          onChange={setDbSource}
        />
      </header>

      <Tabs
        ariaLabel="Find artist or show all artists"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: "query",
            tabId: QUERY_TAB_ID,
            panelId: QUERY_PANEL_ID,
            label: "Find artist",
            children: <ArtistQuery dbSource={dbSource} />,
          },
          {
            id: "list",
            tabId: LIST_TAB_ID,
            panelId: LIST_PANEL_ID,
            label: "Show all artists",
            children: (
              <>
                <h2>All artists</h2>
                <AllArtistsList dbSource={dbSource} />
              </>
            ),
          },
        ]}
      />
    </>
  );
};

export default MainWindowWrapper;
