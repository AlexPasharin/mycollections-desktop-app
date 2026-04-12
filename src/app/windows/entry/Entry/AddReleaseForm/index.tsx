import { useEffect, useState, type FC } from "react";

import AddReleaseForm, { type AddReleaseFormProps } from "./AddReleaseForm";
import styles from "./AddReleaseForm.module.css";

import api from "@/app/windows/entry/api";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";

type AddReleaseFormWrapperProps = Omit<
  AddReleaseFormProps,
  "releasesFormats" | "labels"
>;

const AddReleaseFormWrapper: FC<AddReleaseFormWrapperProps> = (props) => {
  const [releasesFormats, setReleasesFormats] = useState<
    ReleasesFormatListItem[]
  >([]);
  const [labels, setLabels] = useState<LabelListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoadingFailed, setDataLoadingFailed] = useState(false);

  useEffect(() => {
    Promise.all([api.fetchReleasesFormats(), api.fetchLabels()])
      .then(([formatsData, labelsData]) => {
        setReleasesFormats(formatsData);
        setLabels(labelsData);
      })
      .catch((error: unknown) => {
        console.error("Error fetching release formats or labels", error);
        setDataLoadingFailed(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.section}>
        <p className={styles.formatsLoadState}>
          Loading&hellip;
        </p>
      </div>
    );
  }

  if (dataLoadingFailed) {
    return (
      <div className={styles.section}>
        <p className={styles.formatsLoadState} role="alert">
          Could not load data required for the form.
        </p>
      </div>
    );
  }

  return (
    <AddReleaseForm
      {...props}
      releasesFormats={releasesFormats}
      labels={labels}
    />
  );
};

export default AddReleaseFormWrapper;
