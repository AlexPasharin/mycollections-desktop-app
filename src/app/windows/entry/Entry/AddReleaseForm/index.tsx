import { useEffect, useState, type FC } from "react";

import AddReleaseForm, { type AddReleaseFormProps } from "./AddReleaseForm";
import styles from "./AddReleaseForm.module.css";

import api from "@/app/windows/entry/api";
import type { DbSource } from "@/db/db-source";
import type { CountryListItem } from "@/types/countries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";

type AddReleaseFormWrapperProps = Omit<
  AddReleaseFormProps,
  "allFormats" | "labels" | "sortedTagEntries" | "allCountries"
> & {
  dbSource: DbSource;
  tagsLoading: boolean;
  tagsLoadFailed: boolean;
};

const AddReleaseFormWrapper: FC<AddReleaseFormWrapperProps> = ({
  dbSource,
  tags,
  tagsLoading,
  tagsLoadFailed,
  ...formProps
}) => {
  const [releasesFormats, setReleasesFormats] = useState<
    ReleasesFormatListItem[]
  >([]);
  const [labels, setLabels] = useState<LabelListItem[]>([]);
  const [countries, setCountries] = useState<CountryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoadingFailed, setDataLoadingFailed] = useState(false);

  useEffect(() => {
    Promise.all([
      api.fetchReleasesFormats(dbSource),
      api.fetchLabels(dbSource),
      api.fetchCountries(dbSource),
    ])
      .then(([formatsData, labelsData, countriesData]) => {
        setReleasesFormats(formatsData);
        setLabels(labelsData);
        setCountries(countriesData);
      })
      .catch((error: unknown) => {
        console.error(
          "Error fetching release formats, labels, or countries",
          error,
        );
        setDataLoadingFailed(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dbSource]);

  if (loading || tagsLoading) {
    return (
      <div className={styles.section}>
        <p className={styles.formatsLoadState}>Loading&hellip;</p>
      </div>
    );
  }

  if (dataLoadingFailed || tagsLoadFailed) {
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
      {...formProps}
      dbSource={dbSource}
      allFormats={releasesFormats}
      labels={labels}
      tags={tags.filter(
        (t) => !formProps.entry.tags.some((t2) => t2.tagId === t.tagId),
      )}
      allCountries={countries}
    />
  );
};

export default AddReleaseFormWrapper;
