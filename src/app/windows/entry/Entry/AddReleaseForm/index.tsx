import {
  useEffect,
  useMemo,
  type Dispatch,
  type FC,
  type SetStateAction,
} from "react";

import AddReleaseForm, { type AddReleaseFormProps } from "./AddReleaseForm";
import styles from "./AddReleaseForm.module.css";
import {
  initialAddReleaseFormDraftValue,
  type AddReleaseFormDraft,
  type AddReleaseFormTabData,
} from "./addReleaseFormUtils/formValues";

import type { TagListItem } from "@/types/tags";

type AddReleaseFormWrapperProps = Omit<
  AddReleaseFormProps,
  "form" | "setForm" | "tagsAvailableForReleases"
> & {
  form: AddReleaseFormDraft | null;
  onFormChange: Dispatch<SetStateAction<AddReleaseFormDraft | null>>;
  tabData?: AddReleaseFormTabData | undefined;
  referenceDataLoading: boolean;
  referenceDataLoadFailed: boolean;
  tags: TagListItem[];
};

const AddReleaseFormWrapper: FC<AddReleaseFormWrapperProps> = ({
  referenceDataLoading,
  referenceDataLoadFailed,
  form,
  onFormChange,
  tabData,
  entry,
  tags,
  allFormats,
  allCountries,
  ...formProps
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
    if (!dataReady || form !== null) {
      return;
    }

    onFormChange(
      initialAddReleaseFormDraftValue({
        entry,
        allFormats,
        allCountries,
        tabData,
      }),
    );
  }, [dataReady, form, onFormChange, tabData, entry, allFormats, allCountries]);

  if (referenceDataLoading || form === null) {
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
    <AddReleaseForm
      {...formProps}
      entry={entry}
      form={form}
      setForm={(update) => {
        onFormChange((prev) => {
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

export default AddReleaseFormWrapper;
