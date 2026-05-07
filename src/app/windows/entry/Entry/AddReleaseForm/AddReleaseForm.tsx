import { useState, type FC, type FormEvent } from "react";

import AddReleaseCatalogueNumbersSection from "./AddReleaseCatalogueNumbersSection";
import AddReleaseCountriesSection from "./AddReleaseCountriesSection";
import styles from "./AddReleaseForm.module.css";
import AddReleaseFormFormatsSection from "./AddReleaseFormFormatsSection";
import {
  removeMadeInCountrySelectionRowFromFieldErrors,
  stripPrintedInFromCountriesFieldErrors,
  isCatalogueNumbersInputFieldKey,
  isCountriesInputFieldKey,
  isFormatInputFieldKey,
  isReleaseDateInputFieldKey,
  type AddReleaseFormFieldErrors,
  type AddReleaseFormInputFieldKey,
  emptyMutableCountriesSubsectionErrors,
  initialAddReleaseFormFieldErrors,
} from "./addReleaseFormUtils/errorMessages";
import {
  defaultCatalogueNumberRow,
  defaultFormatInputRow,
  emptyCountrySelection,
  initialAddReleaseFormDraftValue,
  type AddReleaseFormDraft,
} from "./addReleaseFormUtils/formValues";
import AddReleaseMatrixRunoutField from "./AddReleaseMatrixRunoutField";
import AddReleaseTagsSection from "./AddReleaseTagsSection";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import GeneralizedDateFormInput from "@/app/components/GeneralizedDateFormInput";
import type { CountryListItem } from "@/types/countries";
import type { GeneralizedDate } from "@/types/date";
import type { EntryByIdResult } from "@/types/entries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { TagListItem } from "@/types/tags";
import { omitProperty } from "@/utils/common";

type AddReleaseFormEntry = Omit<EntryByIdResult, "originalReleaseDate"> & {
  originalReleaseDate: GeneralizedDate | null;
};

export type AddReleaseFormProps = {
  entry: AddReleaseFormEntry;
  allFormats: ReleasesFormatListItem[];
  labels: LabelListItem[];
  tags: TagListItem[];
  allCountries: CountryListItem[];
  onCancel: () => void;
};

const RELEASE_DATE_FIELD_ERROR_ID = "add-release-date-error";
const RELEASE_VERSION_FIELD_ERROR_ID = "add-release-version-error";
const RELEASE_VERSION_FIELD_NOTIFICATIONS_ID =
  "add-release-version-notifications";

const AddReleaseForm: FC<AddReleaseFormProps> = ({
  entry,
  onCancel,
  allFormats,
  labels,
  tags,
  allCountries,
}) => {
  const { originalReleaseDate } = entry;

  const [form, setForm] = useState<AddReleaseFormDraft>(
    initialAddReleaseFormDraftValue(originalReleaseDate, allFormats),
  );

  const [fieldErrors, setFieldErrors] = useState<AddReleaseFormFieldErrors>(
    initialAddReleaseFormFieldErrors,
  );

  const [printedInCountriesSectionOpen, setPrintedInCountriesSectionOpen] =
    useState(false);

  const setFieldValue = <K extends keyof AddReleaseFormDraft>(
    key: K,
    value:
      | AddReleaseFormDraft[K]["value"]
      | ((prev: AddReleaseFormDraft) => AddReleaseFormDraft[K]["value"]),
  ) =>
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: typeof value === "function" ? value(prev) : value,
      },
    }));

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

  // on focus we attempt to remove errors related to the field that is being focused
  const onFocus = (key: AddReleaseFormInputFieldKey) => {
    if (key === "releaseVersion") {
      setField("releaseVersion", (prev) => ({
        ...prev.releaseVersion,
        notifications: [],
      }));
    }

    setFieldErrors((prev) => {
      if (isFormatInputFieldKey(key)) {
        const { formats } = prev;
        const { formatRowId, field } = key;

        const nextFormatRowErrors = prev.formats[formatRowId]?.filter(
          (error) =>
            error.sources &&
            error.sources.length > 0 &&
            !error.sources.includes(field),
        );

        return {
          ...prev,
          formats: nextFormatRowErrors
            ? {
                ...formats,
                [formatRowId]: nextFormatRowErrors,
              }
            : omitProperty(formats, formatRowId),
        };
      }

      if (isCatalogueNumbersInputFieldKey(key)) {
        const { catalogueNumbers } = prev;
        const { catNumberRowId, field, inputValueId } = key;

        const rowErrors = catalogueNumbers[catNumberRowId];

        if (!rowErrors) {
          return prev;
        }

        const errorKey =
          field === "label"
            ? "labelInputErrorMessages"
            : "catNumberInputErrorMessages";

        const nextRowErrors = {
          ...rowErrors,
          [errorKey]: omitProperty(rowErrors[errorKey], inputValueId),
        };

        return {
          ...prev,
          catalogueNumbers: {
            ...catalogueNumbers,
            [catNumberRowId]: nextRowErrors,
          },
        };
      }

      if (isCountriesInputFieldKey(key)) {
        const { countries } = prev;
        const { countriesSubsection, rowId } = key;
        const subsection = countries[countriesSubsection];

        // The focused row's per-row error is dropped, and subsection-level
        // errors (uniqueness, plus the cross-section "made-in required when
        // printed-in is set" rule that lives on madeIn) are cleared too —
        // editing this row can resolve all of them and they'll be re-checked
        // on blur.
        const nextSubsection = {
          countrySelectErrorMessages: omitProperty(
            subsection.countrySelectErrorMessages,
            rowId,
          ),
          propertyErrorMessages: new Set<string>(),
        };

        return {
          ...prev,
          countries: {
            ...countries,
            [countriesSubsection]: nextSubsection,
          },
        };
      }

      const errorKey = isReleaseDateInputFieldKey(key) ? "releaseDate" : key;

      const errors = prev[errorKey].filter(
        (error) =>
          error.sources &&
          error.sources.length > 0 &&
          !error.sources.includes(key),
      );

      return {
        ...prev,
        [errorKey]: errors,
      };
    });
  };

  const validateField = <K extends keyof AddReleaseFormDraft>(key: K) => {
    const formFieldData = form[key];

    // Correlated union: TS can't see that `value` and `validationFn`'s parameter
    // share the same K, so we narrow the call signature locally. Sound because
    // both fields come from the same `form[key]` instance.
    type ValueType = AddReleaseFormDraft[K]["value"];
    type ResultType = ReturnType<AddReleaseFormDraft[K]["validationFn"]>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const validationFn = formFieldData.validationFn as (
      v: ValueType,
    ) => ResultType;
    const validationResult = validationFn(formFieldData.value);
    const { valid, value } = validationResult;

    setField(key, (prev) => ({
      ...prev[key],
      valid,
      value,
      notifications: validationResult.valid
        ? (validationResult.notifications ?? [])
        : [],
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [key]: validationResult.valid
        ? initialAddReleaseFormFieldErrors[key]
        : validationResult.errorMessages,
    }));

    return validationResult;
  };

  const onBlur = (key: keyof AddReleaseFormDraft) => {
    if (key === "selectedTags") {
      return;
    }

    return validateField(key);
  };

  const addFormatRow = () => {
    setFieldValue("formats", (prev) => [
      ...prev.formats.value,
      defaultFormatInputRow(),
    ]);
  };

  const removeFormatRow = (rowId: string) => {
    setFieldValue("formats", (prev) =>
      prev.formats.value.filter((formatRow) => formatRow.id !== rowId),
    );
  };

  const addCatalogueNumbersRow = () => {
    setFieldValue("catalogueNumbers", (prev) => [
      ...prev.catalogueNumbers.value,
      defaultCatalogueNumberRow(),
    ]);
  };

  const removeCatalogueNumbersRow = (rowId: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      catalogueNumbers: omitProperty(prev.catalogueNumbers, rowId),
    }));

    setFieldValue("catalogueNumbers", (prev) =>
      prev.catalogueNumbers.value.filter((row) => row.id !== rowId),
    );
  };

  const addSelectedTag = (tagId: string, tag: string) => {
    setField("selectedTags", (prev) => ({
      ...prev.selectedTags,
      [tagId]: tag,
    }));
  };

  const removeSelectedTag = (tagId: string) => {
    setField("selectedTags", (prev) => ({
      ...prev.selectedTags,
      value: omitProperty(prev.selectedTags.value, tagId),
    }));
  };

  const addCountrySelectionRow = () => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      madeIn: [...prev.countries.value.madeIn, emptyCountrySelection()],
    }));
  };

  const removeCountrySelectionRow = (inputId: string) => {
    setFieldErrors((prev) => {
      const nextCountries = removeMadeInCountrySelectionRowFromFieldErrors(
        prev.countries,
        inputId,
      );

      if (nextCountries === prev.countries) {
        return prev;
      }

      return { ...prev, countries: nextCountries };
    });

    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      madeIn: prev.countries.value.madeIn.filter((row) => row.id !== inputId),
    }));
  };

  const clearAllCountries = () => {
    setPrintedInCountriesSectionOpen(false);

    setFieldErrors((prev) => ({
      ...prev,
      countries: {
        madeIn: emptyMutableCountriesSubsectionErrors(),
        printedIn: emptyMutableCountriesSubsectionErrors(),
      },
    }));

    setFieldValue("countries", {
      madeIn: [],
      printedIn: [],
    });
  };

  const setCountrySelectionCodeName = (inputId: string, codeName: string) => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      madeIn: prev.countries.value.madeIn.map((row) =>
        row.id === inputId ? { ...row, codeName } : row,
      ),
    }));
  };

  const openPrintedInCountriesSection = () => {
    setPrintedInCountriesSectionOpen(true);
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: [...prev.countries.value.printedIn, emptyCountrySelection()],
    }));
  };

  const closePrintedInCountriesSection = () => {
    setPrintedInCountriesSectionOpen(false);

    setFieldErrors((prev) => {
      const nextCountries = stripPrintedInFromCountriesFieldErrors(
        prev.countries,
      );

      if (nextCountries === prev.countries) {
        return prev;
      }

      return { ...prev, countries: nextCountries };
    });

    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: [...prev.countries.value.printedIn, emptyCountrySelection()],
    }));
  };

  const addPrintedInCountrySelectionRow = () => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: [...prev.countries.value.printedIn, emptyCountrySelection()],
    }));
  };

  const removePrintedInCountrySelectionRow = (inputId: string) => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: prev.countries.value.printedIn.filter(
        (row) => row.id !== inputId,
      ),
    }));
  };

  const setPrintedInCountrySelectionCodeName = (
    inputId: string,
    codeName: string,
  ) => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: prev.countries.value.printedIn.map((row) =>
        row.id === inputId ? { ...row, codeName } : row,
      ),
    }));
  };

  const validateReleaseVersionField = () => validateField("releaseVersion");
  const validateReleaseDateFields = () => validateField("releaseDate");
  const validateCountriesFields = () => validateField("countries");
  const validateFormatsFields = () => validateField("formats");
  const validateCatNumbersFields = () => validateField("catalogueNumbers");
  const validateMatrixRunoutField = () => validateField("matrixRunout");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const { selectedTags } = form;

    const releaseVersionValidationResult = validateReleaseVersionField();
    const releaseDateValidationResult = validateReleaseDateFields();
    const countriesValidationResult = validateCountriesFields();
    const formatsValidationResult = validateFormatsFields();
    const catNumbersValidationResult = validateCatNumbersFields();
    const matrixRunoutValidationResult = validateMatrixRunoutField();

    const formIsValid =
      releaseVersionValidationResult.valid &&
      releaseDateValidationResult.valid &&
      countriesValidationResult.valid &&
      formatsValidationResult.valid &&
      catNumbersValidationResult.valid &&
      matrixRunoutValidationResult.valid;

    console.info({
      form,
      formIsValid,
      selectedTags: Object.entries(selectedTags),
    });
  };

  const releaseVersionErrors = fieldErrors.releaseVersion;
  const releaseVersionNotifications = form.releaseVersion.notifications;
  const matrixRunoutErrors = fieldErrors.matrixRunout;
  const releaseDateErrors = fieldErrors.releaseDate;
  const hasReleaseVersionErrors = releaseVersionErrors.length > 0;
  const hasReleaseVersionNotifications = releaseVersionNotifications.length > 0;
  const hasReleaseDateErrors = releaseDateErrors.length > 0;

  const releaseVersionDescribedByIds = [
    hasReleaseVersionErrors ? RELEASE_VERSION_FIELD_ERROR_ID : null,
    hasReleaseVersionNotifications
      ? RELEASE_VERSION_FIELD_NOTIFICATIONS_ID
      : null,
  ]
    .filter((id): id is string => id !== null)
    .join(" ");

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
            value={form.releaseVersion.value}
            onChange={(e) => setFieldValue("releaseVersion", e.target.value)}
            onFocus={() => onFocus("releaseVersion")}
            onBlur={() => onBlur("releaseVersion")}
            aria-invalid={hasReleaseVersionErrors}
            aria-describedby={releaseVersionDescribedByIds || undefined}
            autoComplete="off"
            required
          />
          <FormFieldErrorMessages
            id={RELEASE_VERSION_FIELD_ERROR_ID}
            messages={releaseVersionErrors}
          />
          <FormFieldNotifications
            id={RELEASE_VERSION_FIELD_NOTIFICATIONS_ID}
            messages={releaseVersionNotifications}
          />
        </div>

        <hr
          className={`${styles.sectionDivider} ${styles.sectionDividerMoreSpaceBefore}`}
          aria-hidden
        />

        <div className={styles.field}>
          <h2 className={styles.heading}>Release date</h2>
          <GeneralizedDateFormInput
            date={form.releaseDate.value}
            startDate={entry.originalReleaseDate}
            setDate={(releaseDate) => setFieldValue("releaseDate", releaseDate)}
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
          countries={allCountries}
          countrySelections={form.countries.value.madeIn}
          onSetCountryCodeName={setCountrySelectionCodeName}
          onAddRow={addCountrySelectionRow}
          onRemoveRow={removeCountrySelectionRow}
          onFocus={(rowId) => onFocus({ countriesSubsection: "madeIn", rowId })}
          onBlur={() => onBlur("countries")}
          heading="Countries"
          selectIdPrefix="add-release-country"
          rowLabelPrefix="Country"
          removeRowAriaLabel="Remove country row"
          onRemove={clearAllCountries}
          removeAriaLabel="Remove all countries and printed-in countries"
          errors={fieldErrors.countries.madeIn}
        />

        {printedInCountriesSectionOpen ? (
          <AddReleaseCountriesSection
            countries={allCountries}
            countrySelections={form.countries.value.printedIn}
            onSetCountryCodeName={setPrintedInCountrySelectionCodeName}
            onAddRow={addPrintedInCountrySelectionRow}
            onRemoveRow={removePrintedInCountrySelectionRow}
            onFocus={(rowId) =>
              onFocus({ countriesSubsection: "printedIn", rowId })
            }
            onBlur={() => onBlur("countries")}
            heading="Printed in countries"
            selectIdPrefix="add-release-printed-in-country"
            rowLabelPrefix="Printed-in country"
            removeRowAriaLabel="Remove printed-in country row"
            onRemove={closePrintedInCountriesSection}
            removeAriaLabel='Remove "printed in" countries section'
            errors={fieldErrors.countries.printedIn}
          />
        ) : (
          <button
            type="button"
            className={styles.printedInCountriesCta}
            onClick={openPrintedInCountriesSection}
          >
            Add &quot;printed in&quot; countries
          </button>
        )}

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseFormFormatsSection
          formatInputs={form.formats.value}
          releasesFormats={allFormats}
          errors={fieldErrors.formats}
          setFormats={(stateUpdateFn) =>
            setFieldValue("formats", (prev) =>
              stateUpdateFn(prev.formats.value),
            )
          }
          addFormatRow={addFormatRow}
          removeFormatRow={removeFormatRow}
          onFieldFocus={onFocus}
          onBlur={() => onBlur("formats")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseCatalogueNumbersSection
          labels={labels}
          catalogueNumbers={form.catalogueNumbers.value}
          setCatalogueNumbers={(update) =>
            setFieldValue("catalogueNumbers", (prev) =>
              update(prev.catalogueNumbers.value),
            )
          }
          errors={fieldErrors.catalogueNumbers}
          addCatalogueNumbersRow={addCatalogueNumbersRow}
          removeCatalogueNumbersRow={removeCatalogueNumbersRow}
          onFieldFocus={onFocus}
          onBlurRowColumn={() => onBlur("catalogueNumbers")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseMatrixRunoutField
          matrixRunout={form.matrixRunout.value}
          errorMessages={matrixRunoutErrors}
          onValueChange={(value) =>
            setFieldValue("matrixRunout", (prev) => ({
              ...prev.matrixRunout.value,
              value,
            }))
          }
          onTreatAsTextChange={(treatAsText) =>
            setFieldValue("matrixRunout", (draft) => ({
              ...draft.matrixRunout.value,
              treatAsText,
            }))
          }
          onFocus={() => onFocus("matrixRunout")}
          onBlur={() => onBlur("matrixRunout")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseTagsSection
          tags={tags}
          selectedTags={form.selectedTags.value}
          onAddTag={addSelectedTag}
          onRemoveTag={removeSelectedTag}
        />

        <div className={styles.actions}>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" onMouseDown={(e) => e.preventDefault()}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReleaseForm;
