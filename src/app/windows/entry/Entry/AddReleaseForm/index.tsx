import { useState, type FC, type FormEvent } from "react";

import styles from "./AddReleaseForm.module.css";

type AddReleaseFormProps = {
  onCancel: () => void;
};

const AddReleaseForm: FC<AddReleaseFormProps> = ({ onCancel }) => {
  const [releaseVersion, setReleaseVersion] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="add-release-version">
            Release version
          </label>
          <input
            id="add-release-version"
            className={styles.input}
            type="text"
            value={releaseVersion}
            onChange={(e) => setReleaseVersion(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default AddReleaseForm;
