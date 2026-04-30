import { useEffect, useState, type FC } from "react";

import AddReleaseForm, { type AddReleaseFormProps } from "./AddReleaseForm";
import styles from "./AddReleaseForm.module.css";

import api from "@/app/windows/entry/api";
import type { CountryListItem } from "@/types/countries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { TagListItem } from "@/types/tags";

type AddReleaseFormWrapperProps = Omit<
  AddReleaseFormProps,
  "allFormats" | "labels" | "tags" | "allCountries"
>;

const AddReleaseFormWrapper: FC<AddReleaseFormWrapperProps> = (props) => {
  const [releasesFormats, setReleasesFormats] = useState<
    ReleasesFormatListItem[]
  >([]);
  const [labels, setLabels] = useState<LabelListItem[]>([]);
  const [tags, setTags] = useState<TagListItem[]>([]);
  const [countries, setCountries] = useState<CountryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoadingFailed, setDataLoadingFailed] = useState(false);

  useEffect(() => {
    Promise.all([
      api.fetchReleasesFormats(),
      api.fetchLabels(),
      api.fetchTags(),
      api.fetchCountries(),
    ])
      .then(([formatsData, labelsData, tagsData, countriesData]) => {
        setReleasesFormats(formatsData);
        setLabels(labelsData);
        setTags(tagsData);
        setCountries(countriesData);
      })
      .catch((error: unknown) => {
        console.error(
          "Error fetching release formats, labels, tags, or countries",
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
      allFormats={releasesFormats}
      labels={labels}
      tags={tags}
      allCountries={countries}
    />
  );
};

export default AddReleaseFormWrapper;
