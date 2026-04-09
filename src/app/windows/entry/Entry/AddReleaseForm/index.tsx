import { useEffect, useState, type FC } from "react";

import AddReleaseForm, { type AddReleaseFormProps } from "./AddReleaseForm";
import styles from "./AddReleaseForm.module.css";

import api from "@/app/windows/entry/api";
import type { ReleasesFormatListItem } from "@/types/formats";

export { createGeneralizedDateSchema } from "@/validation/generalizedDate";

export type { AddReleaseFormEntry } from "./AddReleaseForm";

type AddReleaseFormWrapperProps = Omit<AddReleaseFormProps, "releasesFormats">;

const AddReleaseFormWrapper: FC<AddReleaseFormWrapperProps> = (props) => {
  const [releasesFormats, setReleasesFormats] = useState<
    ReleasesFormatListItem[]
  >([]);
  const [loadingFormats, setLoadingFormats] = useState(true);
  const [formatsLoadFailed, setFormatsLoadFailed] = useState(false);

  useEffect(() => {
    api
      .fetchReleasesFormats()
      .then((data) => {
        setReleasesFormats(data);
        setLoadingFormats(false);
      })
      .catch((error: unknown) => {
        console.error("Error fetching release formats", error);
        setFormatsLoadFailed(true);
        setLoadingFormats(false);
      });
  }, []);

  if (loadingFormats) {
    return (
      <div className={styles.section}>
        <p className={styles.formatsLoadState}>Loading formats&hellip;</p>
      </div>
    );
  }

  if (formatsLoadFailed) {
    return (
      <div className={styles.section}>
        <p className={styles.formatsLoadState} role="alert">
          Could not load release formats.
        </p>
      </div>
    );
  }

  return <AddReleaseForm {...props} releasesFormats={releasesFormats} />;
};

export default AddReleaseFormWrapper;
