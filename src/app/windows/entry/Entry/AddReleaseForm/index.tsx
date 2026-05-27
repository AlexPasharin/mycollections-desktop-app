import { useEffect, useMemo, useState, type FC } from "react";

import AddReleaseForm, { type AddReleaseFormProps } from "./AddReleaseForm";
import styles from "./AddReleaseForm.module.css";

import api from "@/app/windows/entry/api";
import type { DbSource } from "@/db/db-source";
import type { CountryListItem } from "@/types/countries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { TagsById } from "@/types/tags";

type AddReleaseFormWrapperProps = Omit<
  AddReleaseFormProps,
  "allFormats" | "labels" | "tags" | "sortedTagEntries" | "allCountries"
> & {
  dbSource: DbSource;
};

const AddReleaseFormWrapper: FC<AddReleaseFormWrapperProps> = ({
  dbSource,
  ...formProps
}) => {
  const { entry } = formProps;

  const [releasesFormats, setReleasesFormats] = useState<
    ReleasesFormatListItem[]
  >([]);
  const [labels, setLabels] = useState<LabelListItem[]>([]);
  const [tags, setTags] = useState<TagsById>({});
  const [countries, setCountries] = useState<CountryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoadingFailed, setDataLoadingFailed] = useState(false);

  const sortedTagEntries = useMemo(() => {
    const entryTagIdSet = new Set(entry.tags.map((t) => t.tagId));

    return Object.entries(tags)
      .filter(([tagId]) => !entryTagIdSet.has(tagId))
      .sort(([_a, tagA], [_b, tagB]) => tagA.localeCompare(tagB));
  }, [tags, entry.tags]);

  useEffect(() => {
    Promise.all([
      api.fetchReleasesFormats(dbSource),
      api.fetchLabels(dbSource),
      api.fetchTags(dbSource),
      api.fetchCountries(dbSource),
    ])
      .then(([formatsData, labelsData, tagsData, countriesData]) => {
        setReleasesFormats(formatsData);
        setLabels(labelsData);
        setTags(Object.fromEntries(tagsData.map((t) => [t.tagId, t.tag])));
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
  }, [dbSource]);

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
      {...formProps}
      dbSource={dbSource}
      allFormats={releasesFormats}
      labels={labels}
      tags={tags}
      sortedTagEntries={sortedTagEntries}
      allCountries={countries}
    />
  );
};

export default AddReleaseFormWrapper;
