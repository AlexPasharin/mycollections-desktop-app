import { useState, type FC } from "react";

import ArtistQuery from "./ArtistQuery";
import styles from "./MainWindowWrapper.module.css";

import api from "../api";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const MainWindowWrapper: FC = () => {
  useDocumentTitle("My Collections - Main Window");

  const [showArtistQuery, setShowArtistQuery] = useState(false);

  return (
    <>
      <h1>My Collections</h1>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => setShowArtistQuery((show) => !show)}
        >
          Find artist
        </button>
        <button type="button" onClick={api.openNewArtistsListWindow}>
          Open Artists Window
        </button>
      </div>
      {showArtistQuery && (
        <div className={styles.artistQuery}>
          <ArtistQuery />
        </div>
      )}
    </>
  );
};

export default MainWindowWrapper;
