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
} from "./releaseFormUtils/formValues";

import type { TagListItem } from "@/types/tags";

type ReleaseFormWrapperProps = Omit<
  ReleaseFormProps,
  "formState" | "setFormState" | "tagsAvailableForReleases" | "onClearFormState"
> & {
  formState: ReleaseFormState | null;
  onFormStateChange: Dispatch<SetStateAction<ReleaseFormState | null>>;
  referenceDataLoading: boolean;
  referenceDataLoadFailed: boolean;
  tags: TagListItem[];
};

const ReleaseFormWrapper: FC<ReleaseFormWrapperProps> = (props) => {
  const {
    referenceDataLoading,
    referenceDataLoadFailed,
    formState,
    onFormStateChange,
    tabData,
    entry,
    tags,
    allFormats,
    allCountries,
    primaryDbSource,
    labels,
  } = props;

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
        releaseBlueprint: tabData.releaseBlueprint,
        dbSources: tabData.dbSources,
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

  const setFormState = (update: SetStateAction<ReleaseFormState>) => {
    onFormStateChange((prev) => {
      if (prev === null) {
        return prev;
      }

      return typeof update === "function" ? update(prev) : update;
    });
  };

  const onClearFormState = () => {
    setFormState(
      initialReleaseFormStateValue({
        entry,
        allFormats,
        allCountries,
        dbSources: tabData.dbSources,
      }),
    );
  };

  return (
    <ReleaseForm
      entry={entry}
      primaryDbSource={primaryDbSource}
      labels={labels}
      allFormats={allFormats}
      allCountries={allCountries}
      onClearFormState={onClearFormState}
      formState={formState}
      setFormState={setFormState}
      tagsAvailableForReleases={tagsAvailableForReleases}
      tabData={tabData}
    />
  );
};

export default ReleaseFormWrapper;
