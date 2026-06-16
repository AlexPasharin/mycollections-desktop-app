import {
  useEffect,
  useMemo,
  type Dispatch,
  type FC,
  type SetStateAction,
} from "react";

import ReleaseForm, { type ReleaseFormProps } from "./ReleaseForm";
import styles from "./ReleaseForm.module.css";
import {
  initialReleaseFormStateValue,
  type ReleaseFormState,
  type ReleaseFormTabData,
} from "./releaseFormUtils/formValues";

import type { TagListItem } from "@/types/tags";

type ReleaseFormWrapperProps = Omit<
  ReleaseFormProps,
  "formState" | "setFormState" | "tagsAvailableForReleases"
> & {
  formState: ReleaseFormState | null;
  onFormStateChange: Dispatch<SetStateAction<ReleaseFormState | null>>;
  tabData?: ReleaseFormTabData | undefined;
  referenceDataLoading: boolean;
  referenceDataLoadFailed: boolean;
  tags: TagListItem[];
};

const ReleaseFormWrapper: FC<ReleaseFormWrapperProps> = ({
  referenceDataLoading,
  referenceDataLoadFailed,
  formState,
  onFormStateChange,
  tabData,
  entry,
  tags,
  allFormats,
  allCountries,
  ...sharedProps
}) => {
  const tagsAvailableForReleases = useMemo(
    () =>
      tags.filter(
        (tag) => !entry.tags.some((entryTag) => entryTag.tagId === tag.tagId),
      ),
    [tags, entry.tags],
  );

  const dataReady = !referenceDataLoading && !referenceDataLoadFailed;

  useEffect(() => {
    if (!dataReady || formState !== null) {
      return;
    }

    onFormStateChange(
      initialReleaseFormStateValue({
        entry,
        allFormats,
        allCountries,
        tabData,
      }),
    );
  }, [
    dataReady,
    formState,
    onFormStateChange,
    tabData,
    entry,
    allFormats,
    allCountries,
  ]);

  if (referenceDataLoading || formState === null) {
    return (
      <div className={styles.section}>
        <p className={styles.formatsLoadState}>Loading&hellip;</p>
      </div>
    );
  }

  if (referenceDataLoadFailed) {
    return (
      <div className={styles.section}>
        <p className={styles.formatsLoadState} role="alert">
          Could not load data required for the form.
        </p>
      </div>
    );
  }

  return (
    <ReleaseForm
      {...sharedProps}
      entry={entry}
      formState={formState}
      setFormState={(update) => {
        onFormStateChange((prev) => {
          if (prev === null) {
            return prev;
          }

          return typeof update === "function" ? update(prev) : update;
        });
      }}
      allFormats={allFormats}
      allCountries={allCountries}
      tagsAvailableForReleases={tagsAvailableForReleases}
    />
  );
};

export default ReleaseFormWrapper;
