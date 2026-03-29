import { useState, type FC } from "react";

import AllArtistsList from "./AllArtistsList";
import ArtistQuery from "./ArtistQuery";
import styles from "./MainWindowWrapper.module.css";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type MainPanel = null | "query" | "list";

const MainWindowWrapper: FC = () => {
  useDocumentTitle("My Collections - Main Window");

  const [panel, setPanel] = useState<MainPanel>(null);

  return (
    <>
      <h1>My Collections</h1>
      <div className={styles.actions}>
        <button type="button" onClick={() => setPanel("query")}>
          Find artist
        </button>
        <button type="button" onClick={() => setPanel("list")}>
          Open Artists Window
        </button>
      </div>
      {panel === "query" && (
        <div className={styles.artistQuery}>
          <ArtistQuery />
        </div>
      )}
      {panel === "list" && (
        <div className={styles.artistsList}>
          <h2>All artists</h2>
          <AllArtistsList />
        </div>
      )}
    </>
  );
};

export default MainWindowWrapper;
