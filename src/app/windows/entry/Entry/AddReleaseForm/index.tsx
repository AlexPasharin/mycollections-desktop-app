import { useEffect, useState, type FC } from "react";

import AddReleaseForm, { type AddReleaseFormProps } from "./AddReleaseForm";
import styles from "./AddReleaseForm.module.css";

import api from "@/app/windows/entry/api";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { TagListItem } from "@/types/tags";

type AddReleaseFormWrapperProps = Omit<
  AddReleaseFormProps,
  "releasesFormats" | "labels" | "tags"
>;

const AddReleaseFormWrapper: FC<AddReleaseFormWrapperProps> = (props) => {
  const [releasesFormats, setReleasesFormats] = useState<
    ReleasesFormatListItem[]
  >([]);
  const [labels, setLabels] = useState<LabelListItem[]>([]);
  const [tags, setTags] = useState<TagListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoadingFailed, setDataLoadingFailed] = useState(false);

  useEffect(() => {
    Promise.all([
      api.fetchReleasesFormats(),
      api.fetchLabels(),
      api.fetchTags(),
    ])
      .then(([formatsData, labelsData, tagsData]) => {
        setReleasesFormats(formatsData);
        setLabels(labelsData);
        setTags(tagsData);
      })
      .catch((error: unknown) => {
        console.error(
          "Error fetching release formats, labels, or tags",
          error,
        );
        setDataLoadingFailed(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.section}>
        <p className={styles.formatsLoadState}>Loading&hellip;</p>
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
      tags={tags}
    />
  );
};

export default AddReleaseFormWrapper;
