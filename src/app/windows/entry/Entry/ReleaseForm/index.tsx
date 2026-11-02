import { useMemo, type FC } from "react";

import ReleaseForm, { type ReleaseFormProps } from "./ReleaseForm";
import {
  initialReleaseFormStateValue,
  type ReleaseFormInitialState,
} from "./releaseFormUtils/formValues";

import type { TagListItem } from "@/types/tags";

type ReleaseFormWrapperProps = Omit<
  ReleaseFormProps,
  "initialFormState" | "onPersistFormState" | "tagsAvailableForReleases"
> & {
  persistedFormState: ReleaseFormInitialState | null;
  setPersistedFormState: (state: ReleaseFormInitialState) => void;
  referenceDataLoading: boolean;
  referenceDataLoadFailed: boolean;
  tags: TagListItem[];
  setAddReleaseMode: () => void;
};

const sectionClassName = "mt-4";
const formatsLoadStateClassName = "m-0 text-[1.2rem] font-bold";

const ReleaseFormWrapper: FC<ReleaseFormWrapperProps> = ({
  referenceDataLoading,
  referenceDataLoadFailed,
  persistedFormState,
  setPersistedFormState,
  tabData,
  entry,
  tags,
  allFormats,
  allCountries,
  primaryDbSource,
  labels,
  setAddReleaseMode,
}) => {
  const tagsAvailableForReleases = useMemo(
    () =>
      tags.filter(
        (tag) => !entry.tags.some((entryTag) => entryTag.tagId === tag.tagId),
      ),
    [tags, entry.tags],
  );

  if (referenceDataLoading) {
    return (
      <div className={sectionClassName}>
        <p className={formatsLoadStateClassName}>Loading&hellip;</p>
      </div>
    );
  }

  if (referenceDataLoadFailed) {
    return (
      <div className={sectionClassName}>
        <p className={formatsLoadStateClassName} role="alert">
          Could not load data required for the form.
        </p>
      </div>
    );
  }

  const initialFormState =
    (tabData.releaseBlueprint ? null : persistedFormState) ??
    initialReleaseFormStateValue({
      entry,
      allFormats,
      allCountries,
      releaseBlueprint: tabData.releaseBlueprint,
      dbSources: tabData.dbSources,
      mode: tabData.mode,
    });

  return (
    <ReleaseForm
      entry={entry}
      primaryDbSource={primaryDbSource}
      labels={labels}
      allFormats={allFormats}
      allCountries={allCountries}
      initialFormState={initialFormState}
      onPersistFormState={setPersistedFormState}
      tagsAvailableForReleases={tagsAvailableForReleases}
      tabData={tabData}
      setAddReleaseMode={setAddReleaseMode}
    />
  );
};

export default ReleaseFormWrapper;
