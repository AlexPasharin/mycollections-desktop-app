import { useMemo, type FC } from "react";

import UpsertReleaseForm, { type UpsertReleaseFormProps } from "./UpsertReleaseForm";
import {
  initialUpsertReleaseFormStateValue,
  type UpsertReleaseFormInitialState,
} from "./upsertReleaseFormUtils/formValues";

import type { TagListItem } from "@/types/tags";

type UpsertReleaseFormWrapperProps = Omit<
  UpsertReleaseFormProps,
  "initialFormState" | "onPersistFormState" | "tagsAvailableForReleases"
> & {
  persistedFormState: UpsertReleaseFormInitialState | null;
  setPersistedFormState: (state: UpsertReleaseFormInitialState) => void;
  referenceDataLoading: boolean;
  referenceDataLoadFailed: boolean;
  tags: TagListItem[];
  setAddReleaseMode: () => void;
};

const sectionClassName = "mt-4";
const formatsLoadStateClassName = "m-0 text-[1.2rem] font-bold";

const UpsertReleaseFormWrapper: FC<UpsertReleaseFormWrapperProps> = ({
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
    initialUpsertReleaseFormStateValue({
      entry,
      allFormats,
      allCountries,
      releaseBlueprint: tabData.releaseBlueprint,
      dbSources: tabData.dbSources,
      mode: tabData.mode,
    });

  return (
    <UpsertReleaseForm
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

export default UpsertReleaseFormWrapper;
