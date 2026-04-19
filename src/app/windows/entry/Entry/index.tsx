import { useState, type FC } from "react";

import AddReleaseForm from "./AddReleaseForm";
import styles from "./Entry.module.css";
import EntryArtists from "./EntryArtists";
import EntryDetailsPanel from "./EntryDetailsPanel";
import EntryReleases from "./EntryReleases";

import type { EntryByIdResult } from "@/types/entries";
import { sanitizeReleaseDate } from "@/utils/date";

type EntryProps = {
  entry: EntryByIdResult;
};

type EntryTab = "releases" | "addRelease";

/** Stable ids for this tablist (single Entry view per document). */
const RELEASES_TAB_ID = "releases-tab";
const RELEASES_PANEL_ID = "releases-panel";
const ADD_RELEASE_TAB_ID = "add-release-tab";
const ADD_RELEASE_PANEL_ID = "add-release-panel";

const Entry: FC<EntryProps> = ({ entry }) => {
  const [activeTab, setActiveTab] = useState<EntryTab>("addRelease");

  return (
    <div>
      <h1>{entry.mainName}</h1>

      <EntryArtists artists={entry.artists} />

      <EntryDetailsPanel entry={entry} />

      <section className={styles.tabs} aria-label="Releases and add release">
        <div className={styles.tabList} role="tablist">
          <button
            type="button"
            id={RELEASES_TAB_ID}
            role="tab"
            aria-selected={activeTab === "releases"}
            aria-controls={RELEASES_PANEL_ID}
            className={
              activeTab === "releases"
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
            onClick={() => setActiveTab("releases")}
          >
            Entry releases
          </button>
          <button
            type="button"
            id={ADD_RELEASE_TAB_ID}
            role="tab"
            aria-selected={activeTab === "addRelease"}
            aria-controls={ADD_RELEASE_PANEL_ID}
            className={
              activeTab === "addRelease"
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
            onClick={() => setActiveTab("addRelease")}
          >
            Add release
          </button>
        </div>

        <div
          id={RELEASES_PANEL_ID}
          role="tabpanel"
          aria-labelledby={RELEASES_TAB_ID}
          hidden={activeTab !== "releases"}
          className={styles.tabPanel}
        >
          <EntryReleases entry={entry} />
        </div>

        <div
          id={ADD_RELEASE_PANEL_ID}
          role="tabpanel"
          aria-labelledby={ADD_RELEASE_TAB_ID}
          hidden={activeTab !== "addRelease"}
          className={styles.tabPanel}
        >
          <AddReleaseForm
            entry={{
              ...entry,
              originalReleaseDate: sanitizeReleaseDate(
                entry.originalReleaseDate,
              ),
            }}
            onCancel={() => setActiveTab("releases")}
          />
        </div>
      </section>
    </div>
  );
};

export default Entry;
