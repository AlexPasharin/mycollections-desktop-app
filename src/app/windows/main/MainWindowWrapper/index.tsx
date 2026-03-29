import type { FC } from "react";

import styles from "./MainWindowWrapper.module.css";

import api from "../api";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const MainWindowWrapper: FC = () => {
  useDocumentTitle("My Collections - Main Window");

  return (
    <>
      <h1>My Collections</h1>
      <div className={styles.actions}>
        <button onClick={api.openNewArtistQueryWindow}>Find artist</button>
        <button onClick={api.openNewArtistsListWindow}>
          Open Artists Window
        </button>
      </div>
    </>
  );
};

export default MainWindowWrapper;
