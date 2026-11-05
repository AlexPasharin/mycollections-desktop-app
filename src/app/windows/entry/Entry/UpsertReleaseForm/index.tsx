import { useMemo, useState, type FC } from "react";

import UpsertReleaseForm, {
  cancelButtonClassName,
  type UpsertReleaseFormProps,
} from "./UpsertReleaseForm";
import UpsertReleaseFormBlueprintLoader from "./UpsertReleaseFormBlueprintLoader";
import {
  initialUpsertReleaseFormStateValue,
  type UpsertReleaseFormInitialState,
} from "./upsertReleaseFormUtils/formValues";

import type { ReleaseByIdResult } from "@/types/releases";
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
  onUseReleaseAsBlueprint: (release: ReleaseByIdResult | undefined) => void;
};

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
  onUseReleaseAsBlueprint,
  dbSources,
  setDbSources,
}) => {
  const [isLoadingRelease, setIsLoadingRelease] = useState(false);

  const tagsAvailableForReleases = useMemo(
    () =>
      tags.filter(
        (tag) => !entry.tags.some((entryTag) => entryTag.tagId === tag.tagId),
      ),
    [tags, entry.tags],
  );

  const initialFormState =
    (tabData.releaseBlueprint ? null : persistedFormState) ??
    initialUpsertReleaseFormStateValue({
      entry,
      allFormats,
      allCountries,
      releaseBlueprint: tabData.releaseBlueprint,
      mode: tabData.mode,
    });

  const isUpdateMode = tabData.mode === "update";

  const isLoading = referenceDataLoading || isLoadingRelease;

  return (
    <div className="mt-4">
      <div className="box-border rounded-xl border border-black/18 bg-white p-[1.1rem_1.25rem_1.15rem] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        {isUpdateMode && (
          <button
            type="button"
            className={`${cancelButtonClassName} mb-4`}
            onClick={setAddReleaseMode}
          >
            Back to &quot;create new release&quot; mode
          </button>
        )}
        <UpsertReleaseFormBlueprintLoader
          primaryDbSource={primaryDbSource}
          isLoading={isLoadingRelease}
          setIsLoading={setIsLoadingRelease}
          onReleaseFetched={onUseReleaseAsBlueprint}
        />
        {isLoading ? (
          <p className={formatsLoadStateClassName}>Loading&hellip;</p>
        ) : referenceDataLoadFailed ? (
          <p className={formatsLoadStateClassName} role="alert">
            Could not load data required for the form.
          </p>
        ) : (
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
            dbSources={dbSources}
            setDbSources={setDbSources}
          />
        )}
      </div>
    </div>
  );
};

export default UpsertReleaseFormWrapper;
