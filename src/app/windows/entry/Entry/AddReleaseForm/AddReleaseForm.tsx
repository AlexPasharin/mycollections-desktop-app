import { useMemo, useState, type FC, type FormEvent } from "react";

import AddReleaseCatalogueNumbersSection from "./AddReleaseCatalogueNumbersSection";
import AddReleaseCountriesSection from "./AddReleaseCountriesSection";
import styles from "./AddReleaseForm.module.css";
import AddReleaseFormFormatsSection from "./AddReleaseFormFormatsSection";
import {
  defaultCatalogueNumberRow,
  defaultFormatInputRow,
  getCaNumbersFormFieldErrors,
  getFormatsFormFieldErrors,
  getReleaseDateFormFieldErrors,
  emptyCountrySelection,
  initialAddReleaseFormDraftValue,
  updateCatNumberFieldErrors,
  isCatalogueNumbersInputFieldKey,
  isFormatInputFieldKey,
  isReleaseDateInputFieldKey,
  type AddReleaseFormDraft,
  type AddReleaseFormEntry,
  type AddReleaseFormFieldErrors,
  type AddReleaseFormInputFieldKey,
  type UpdateCatNumberFieldErrorsArgs,
} from "./addReleaseFormUtils";
import AddReleaseMatrixRunoutField from "./AddReleaseMatrixRunoutField";
import AddReleaseTagsSection from "./AddReleaseTagsSection";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import GeneralizedDateFormInput from "@/app/components/GeneralizedDateFormInput";
import type { CountryListItem } from "@/types/countries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { TagListItem } from "@/types/tags";
import {
  getFieldValidationErrorMessages,
  validateAgainstSchema,
  type ValidationResultErrorMessages,
} from "@/utils/validation";
import { createAddReleaseFormSchema } from "@/validation/releases/addReleaseForm";

export type AddReleaseFormProps = {
  entry: AddReleaseFormEntry;
  onCancel: () => void;
  releasesFormats: ReleasesFormatListItem[];
  labels: LabelListItem[];
  tags: TagListItem[];
  countries: CountryListItem[];
};

const RELEASE_DATE_FIELD_ERROR_ID = "add-release-date-error";
const RELEASE_VERSION_FIELD_ERROR_ID = "add-release-version-error";

const AddReleaseForm: FC<AddReleaseFormProps> = ({
  entry,
  onCancel,
  releasesFormats,
  labels,
  tags,
  countries,
}) => {
  const { originalReleaseDate } = entry;

  const addReleaseFormSchema = useMemo(
    () => createAddReleaseFormSchema(originalReleaseDate),
    [originalReleaseDate],
  );

  const [form, setForm] = useState<AddReleaseFormDraft>(
    initialAddReleaseFormDraftValue(originalReleaseDate),
  );

  const [fieldErrors, setFieldErrors] = useState<AddReleaseFormFieldErrors>({});

  const setField = <K extends keyof AddReleaseFormDraft>(
    key: K,
    value:
      | AddReleaseFormDraft[K]
      | ((prev: AddReleaseFormDraft) => AddReleaseFormDraft[K]),
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: typeof value === "function" ? value(prev) : value,
    }));
  };

  const getFieldErrorsPatch = (
    errorMessages?: ValidationResultErrorMessages,
  ) => {
    const fieldErrorsPatch: AddReleaseFormFieldErrors = {};

    if (!errorMessages) {
      return {};
    }

    const releaseDateErrorMessages = errorMessages.filter(
      ({ path }) => path[0] === "releaseDate",
    );
    const formatsErrorMessages = errorMessages.filter(
      ({ path }) => path[0] === "formats",
    );
    const releaseVersionErrorMessages = errorMessages.filter(
      ({ path }) => path[0] === "releaseVersion",
    );
    const matrixRunoutErrorMessages = errorMessages.filter(
      ({ path }) => path[0] === "matrixRunout",
    );

    const catalogueNumbersErrorMessages = errorMessages.filter(
      ({ path }) => path[0] === "catalogueNumbers",
    );

    fieldErrorsPatch.releaseDate = getReleaseDateFormFieldErrors(
      releaseDateErrorMessages,
    );

    fieldErrorsPatch.formats = getFormatsFormFieldErrors(
      formatsErrorMessages,
      form.formats,
    );

    fieldErrorsPatch.releaseVersion = releaseVersionErrorMessages.map(
      ({ message }) => ({ message }),
    );

    fieldErrorsPatch.matrixRunout = matrixRunoutErrorMessages.map(
      ({ message }) => ({ message }),
    );

    fieldErrorsPatch.catalogueNumbers = getCaNumbersFormFieldErrors(
      catalogueNumbersErrorMessages,
      form.catalogueNumbers,
    );

    return fieldErrorsPatch;
  };

  const onFocus = (key: AddReleaseFormInputFieldKey) => {
    setFieldErrors((prev) => {
      if (isFormatInputFieldKey(key)) {
        const { formatRowId, field } = key;
        const { formats } = prev;

        if (!formats) {
          return prev;
        }

        const newFormatErrors = formats[formatRowId]?.filter(
          (error) => error.sources && !error.sources.includes(field),
        );

        return {
          ...prev,
          formats: {
            ...formats,
            [formatRowId]:
              newFormatErrors && newFormatErrors.length > 0
                ? newFormatErrors
                : undefined,
          },
        };
      }

      if (isCatalogueNumbersInputFieldKey(key)) {
        const { catNumberRowId, field, inputValueId } = key;
        const { catalogueNumbers } = prev;

        if (!catalogueNumbers) {
          return prev;
        }

        const rowErrors = catalogueNumbers[catNumberRowId];

        if (!rowErrors) {
          return prev;
        }

        const nextRowErrors: typeof rowErrors = { ...rowErrors };

        if (field === "label") {
          const labelInputErrorMessages = nextRowErrors.labelInputErrorMessages;

          if (labelInputErrorMessages) {
            const { [inputValueId]: _removed, ...restLabelErrors } =
              labelInputErrorMessages;

            nextRowErrors.labelInputErrorMessages =
              Object.keys(restLabelErrors).length > 0
                ? restLabelErrors
                : undefined;
          }
        } else {
          const catNumberInputErrorMessages =
            nextRowErrors.catNumberInputErrorMessages;

          if (catNumberInputErrorMessages) {
            const { [inputValueId]: _removed, ...restCatNumberErrors } =
              catNumberInputErrorMessages;

            nextRowErrors.catNumberInputErrorMessages =
              Object.keys(restCatNumberErrors).length > 0
                ? restCatNumberErrors
                : undefined;
          }
        }

        const rowStillHasErrors =
          Object.keys(nextRowErrors.labelInputErrorMessages ?? {}).length > 0 ||
          Object.keys(nextRowErrors.catNumberInputErrorMessages ?? {}).length >
            0 ||
          (nextRowErrors.rowErrorMessages?.size ?? 0) > 0;

        const { [catNumberRowId]: _removedRow, ...otherRows } =
          catalogueNumbers;

        const nextCatalogueNumbers = rowStillHasErrors
          ? { ...otherRows, [catNumberRowId]: nextRowErrors }
          : otherRows;

        return {
          ...prev,
          catalogueNumbers:
            Object.keys(nextCatalogueNumbers).length > 0
              ? nextCatalogueNumbers
              : undefined,
        };
      }

      const errorKey = isReleaseDateInputFieldKey(key) ? "releaseDate" : key;

      const errors = prev[errorKey]?.filter(
        (error) => error.sources && !error.sources.includes(key),
      );

      return {
        ...prev,
        [errorKey]: errors && errors.length > 0 ? errors : undefined,
      };
    });
  };

  type onBlurKey =
    | Exclude<keyof AddReleaseFormDraft, "catalogueNumbers">
    | UpdateCatNumberFieldErrorsArgs;

  const onBlur = (key: onBlurKey) => {
    setFieldErrors((prev) => {
      if (typeof key === "object") {
        return {
          ...prev,
          catalogueNumbers: updateCatNumberFieldErrors(
            form.catalogueNumbers,
            prev.catalogueNumbers,
            key,
          ),
        };
      }

      const errorMessages = getFieldValidationErrorMessages(
        addReleaseFormSchema,
        form[key],
        key,
      );

      return {
        ...prev,
        ...getFieldErrorsPatch(errorMessages),
      };
    });
  };

  const addFormatRow = () => {
    setField("formats", (prev) => [...prev.formats, defaultFormatInputRow()]);
  };

  const removeFormatRow = (rowId: string) => {
    // if we remove format row, we should also remove errors associated with it
    setFieldErrors((prev) => {
      const { formats } = prev;

      if (!formats) {
        return prev;
      }

      const { [rowId]: _removed, ...rest } = formats;

      return {
        ...prev,
        formats: Object.keys(rest).length > 0 ? rest : undefined,
      };
    });

    setField("formats", (prev) =>
      prev.formats.filter((formatRow) => formatRow.id !== rowId),
    );
  };

  const addCatalogueNumbersRow = () => {
    setField("catalogueNumbers", (prev) => [
      ...prev.catalogueNumbers,
      defaultCatalogueNumberRow(),
    ]);
  };

  const addSelectedTag = (tagId: string, tag: string) => {
    setField("selectedTags", (prev) => ({
      ...prev.selectedTags,
      [tagId]: tag,
    }));
  };

  const removeSelectedTag = (tagId: string) => {
    setField("selectedTags", (prev) => {
      const { [tagId]: _removed, ...rest } = prev.selectedTags;

      return rest;
    });
  };

  const addCountrySelectionRow = () => {
    setField("countrySelections", (prev) => [
      ...prev.countrySelections,
      emptyCountrySelection(),
    ]);
  };

  const removeCountrySelectionRow = (inputId: string) => {
    setField("countrySelections", (prev) => {
      if (prev.countrySelections.length <= 1) {
        return prev.countrySelections;
      }

      return prev.countrySelections.filter((row) => row.id !== inputId);
    });
  };

  const setCountrySelectionCodeName = (inputId: string, codeName: string) => {
    setField("countrySelections", (prev) =>
      prev.countrySelections.map((row) =>
        row.id === inputId ? { ...row, codeName } : row,
      ),
    );
  };

  const removeCatalogueNumbersRow = (rowId: string) => {
    setFieldErrors((prev) => {
      const { catalogueNumbers } = prev;

      if (!catalogueNumbers) {
        return prev;
      }

      const { [rowId]: _removed, ...rest } = catalogueNumbers;

      return {
        ...prev,
        catalogueNumbers: Object.keys(rest).length > 0 ? rest : undefined,
      };
    });

    setField("catalogueNumbers", (prev) =>
      prev.catalogueNumbers.filter((row) => row.id !== rowId),
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const {
      releaseVersion,
      matrixRunout,
      releaseDate,
      formats,
      catalogueNumbers,
      selectedTags,
      countrySelections,
    } = form;

    const dataToValidate = {
      releaseVersion,
      matrixRunout,
      releaseDate,
      formats,
      catalogueNumbers: catalogueNumbers.map((row) => ({
        labelInputValues: row.labelInputValues.map((label) => label.name),
        catalogueNumberInputValues: row.catalogueNumberInputValues.map(
          (catNumber) => catNumber.value,
        ),
      })),
    };

    const result = validateAgainstSchema(addReleaseFormSchema, dataToValidate);

    console.info({
      form,
      result,
      selectedTags: Object.entries(selectedTags),
      countrySelections: countrySelections.map((c) => c.codeName),
    });

    if (!result.success) {
      setFieldErrors(getFieldErrorsPatch(result.errorMessages));

      return;
    }

    setFieldErrors({});
  };

  const releaseVersionErrors = fieldErrors.releaseVersion ?? [];
  const matrixRunoutErrors = fieldErrors.matrixRunout ?? [];
  const releaseDateErrors = fieldErrors.releaseDate ?? [];
  const hasReleaseVersionErrors = releaseVersionErrors.length > 0;
  const hasReleaseDateErrors = releaseDateErrors.length > 0;

  return (
    <div className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.heading} htmlFor="add-release-version">
            Release version
            <sup className={styles.requiredMark} aria-hidden="true">
              *
            </sup>
          </label>
          <input
            id="add-release-version"
            className={styles.input}
            type="text"
            aria-required
            value={form.releaseVersion}
            onChange={(e) => setField("releaseVersion", e.target.value)}
            onFocus={() => onFocus("releaseVersion")}
            onBlur={() => onBlur("releaseVersion")}
            aria-invalid={hasReleaseVersionErrors}
            aria-describedby={
              hasReleaseVersionErrors
                ? RELEASE_VERSION_FIELD_ERROR_ID
                : undefined
            }
            autoComplete="off"
            required
          />
          <FormFieldErrorMessages
            id={RELEASE_VERSION_FIELD_ERROR_ID}
            messages={releaseVersionErrors}
          />
        </div>

        <hr
          className={`${styles.sectionDivider} ${styles.sectionDividerMoreSpaceBefore}`}
          aria-hidden
        />

        <div className={styles.field}>
          <h2 className={styles.heading}>Release date</h2>
          <GeneralizedDateFormInput
            date={form.releaseDate}
            startDate={entry.originalReleaseDate}
            setDate={(releaseDate) => setField("releaseDate", releaseDate)}
            onFocus={onFocus}
            onBlur={() => onBlur("releaseDate")}
            invalid={hasReleaseDateErrors}
            groupErrorId={RELEASE_DATE_FIELD_ERROR_ID}
          />
          <FormFieldErrorMessages
            id={RELEASE_DATE_FIELD_ERROR_ID}
            messages={releaseDateErrors}
          />
        </div>

        <hr
          className={`${styles.sectionDivider} ${styles.sectionDividerMoreSpaceBefore}`}
          aria-hidden
        />

        <AddReleaseCountriesSection
          countries={countries}
          countrySelections={form.countrySelections}
          onSetCountryCodeName={setCountrySelectionCodeName}
          onAddRow={addCountrySelectionRow}
          onRemoveRow={removeCountrySelectionRow}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseFormFormatsSection
          formats={form.formats}
          releasesFormats={releasesFormats}
          errors={fieldErrors.formats}
          setFormats={(stateUpdateFn) =>
            setField("formats", (prev) => stateUpdateFn(prev.formats))
          }
          addFormatRow={addFormatRow}
          removeFormatRow={removeFormatRow}
          onFieldFocus={onFocus}
          onBlur={() => onBlur("formats")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseCatalogueNumbersSection
          labels={labels}
          catalogueNumbers={form.catalogueNumbers}
          setCatalogueNumbers={(update) =>
            setField("catalogueNumbers", (prev) =>
              update(prev.catalogueNumbers),
            )
          }
          errors={fieldErrors.catalogueNumbers}
          addCatalogueNumbersRow={addCatalogueNumbersRow}
          removeCatalogueNumbersRow={removeCatalogueNumbersRow}
          onFieldFocus={onFocus}
          onBlurRowColumn={(catNumberRowId, fieldType) =>
            onBlur({ catNumberRowId, fieldType })
          }
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseMatrixRunoutField
          matrixRunout={form.matrixRunout}
          errorMessages={matrixRunoutErrors}
          onValueChange={(value) =>
            setField("matrixRunout", (draft) => ({
              ...draft.matrixRunout,
              value,
            }))
          }
          onTreatAsTextChange={(treatAsText) =>
            setField("matrixRunout", (draft) => ({
              ...draft.matrixRunout,
              treatAsText,
            }))
          }
          onFocus={() => onFocus("matrixRunout")}
          onBlur={() => onBlur("matrixRunout")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseTagsSection
          tags={tags}
          selectedTags={form.selectedTags}
          onAddTag={addSelectedTag}
          onRemoveTag={removeSelectedTag}
        />

        <div className={styles.actions}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default AddReleaseForm;
