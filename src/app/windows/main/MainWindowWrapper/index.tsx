import { useState, type FC } from "react";

import AllArtistsList from "./AllArtistsList";
import ArtistQuery from "./ArtistQuery";
import styles from "./MainWindowWrapper.module.css";

import { DbSource, DEFAULT_DB_SOURCE } from "@/db/db-source";
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
      <header className={styles.header}>
        <h1>My Collections</h1>

        <div className={styles.dbSourceField}>
          <label className={styles.dbSourceLabel} htmlFor="main-db-source">
            Database
          </label>
          <select
            id="main-db-source"
            className={styles.dbSourceSelect}
            value={dbSource}
            onChange={(event) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- options are DbSource values only
              setDbSource(event.target.value as DbSource);
            }}
          >
            {DB_SOURCE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section
        className={styles.tabs}
        aria-label="Find artist or show all artists"
      >
        <div className={styles.tabList} role="tablist">
          <button
            type="button"
            id={QUERY_TAB_ID}
            role="tab"
            aria-selected={activeTab === "query"}
            aria-controls={QUERY_PANEL_ID}
            className={
              activeTab === "query"
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
            onClick={() => setActiveTab("query")}
          >
            Find artist
          </button>
          <button
            type="button"
            id={LIST_TAB_ID}
            role="tab"
            aria-selected={activeTab === "list"}
            aria-controls={LIST_PANEL_ID}
            className={
              activeTab === "list"
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
            onClick={() => setActiveTab("list")}
          >
            Show all artists
          </button>
        </div>

        <div
          id={QUERY_PANEL_ID}
          role="tabpanel"
          aria-labelledby={QUERY_TAB_ID}
          hidden={activeTab !== "query"}
          className={styles.tabPanel}
        >
          <ArtistQuery />
        </div>

        <div
          id={LIST_PANEL_ID}
          role="tabpanel"
          aria-labelledby={LIST_TAB_ID}
          hidden={activeTab !== "list"}
          className={styles.tabPanel}
        >
          <h2>All artists</h2>
          <AllArtistsList />
        </div>
      </section>
    </>
  );
};

export default MainWindowWrapper;

const DB_SOURCE_OPTIONS: ReadonlyArray<{ value: DbSource; label: string }> = [
  { value: DbSource.LocalDevDb, label: "Local dev" },
  { value: DbSource.LocalProdDb, label: "Local prod" },
  { value: DbSource.RemoteProdDb, label: "Remote prod" },
];
