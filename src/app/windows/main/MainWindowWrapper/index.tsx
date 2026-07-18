import { useState, type FC } from "react";

import AllArtistsList from "./AllArtistsList";
import ArtistQuery from "./ArtistQuery";

import api from "../api";

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

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <button
            type="button"
            className="cursor-pointer rounded-md border border-indigo-600 bg-indigo-600 px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-white transition-[background,border-color] duration-150 ease-in-out hover:border-indigo-700 hover:bg-indigo-700"
            onClick={() => api.openNewTagsWindow({ source: dbSource })}
          >
            Manage tags
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md border border-indigo-600 bg-indigo-600 px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-white transition-[background,border-color] duration-150 ease-in-out hover:border-indigo-700 hover:bg-indigo-700"
            onClick={() => api.openNewLabelsWindow({ source: dbSource })}
          >
            Manage labels
          </button>
          <DbSourceSelect
            id="main-db-source"
            value={dbSource}
            onChange={setDbSource}
          />
        </div>
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
