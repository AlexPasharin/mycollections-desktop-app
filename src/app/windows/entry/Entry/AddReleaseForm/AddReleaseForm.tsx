import { useMemo, useState, type FC, type FormEvent } from "react";

import AddReleaseCatalogueNumbersSection from "./AddReleaseCatalogueNumbersSection";
import AddReleaseCountriesSection from "./AddReleaseCountriesSection";
import styles from "./AddReleaseForm.module.css";
import AddReleaseFormFormatsSection from "./AddReleaseFormFormatsSection";
import {
  getCaNumbersFormFieldErrors,
  getFormatsFormFieldErrors,
  getCountriesFormFieldErrors,
  getReleaseDateFormFieldErrors,
  removeMadeInCountrySelectionRowFromFieldErrors,
  stripPrintedInFromCountriesFieldErrors,
  updateCatNumberFieldErrors,
  isCatalogueNumbersInputFieldKey,
  isFormatInputFieldKey,
  isReleaseDateInputFieldKey,
  type AddReleaseFormFieldErrors,
  type AddReleaseFormInputFieldKey,
  type UpdateCatNumberFieldErrorsArgs,
} from "./addReleaseFormUtils/errorMessages";
import {
  defaultCatalogueNumberRow,
  defaultFormatInputRow,
  emptyCountrySelection,
  initialAddReleaseFormDraftValue,
  type AddReleaseFormDraft,
} from "./addReleaseFormUtils/formValues";
import type { AddReleaseFormFieldNotifications } from "./addReleaseFormUtils/notifications";
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
import {
  getFieldValidationErrorMessages,
  validateAgainstSchema,
  type ValidationResultErrorMessages,
} from "@/utils/validation";
import { createAddReleaseFormSchema } from "@/validation/releases/addReleaseForm";

type AddReleaseFormEntry = Omit<EntryByIdResult, "originalReleaseDate"> & {
  originalReleaseDate: GeneralizedDate | null;
};

export type AddReleaseFormProps = {
  entry: AddReleaseFormEntry;
  releasesFormats: ReleasesFormatListItem[];
  labels: LabelListItem[];
  tags: TagListItem[];
  countries: CountryListItem[];
  onCancel: () => void;
};

const RELEASE_DATE_FIELD_ERROR_ID = "add-release-date-error";
const RELEASE_VERSION_FIELD_ERROR_ID = "add-release-version-error";
const RELEASE_VERSION_FIELD_NOTIFICATIONS_ID =
  "add-release-version-notifications";

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
    () => createAddReleaseFormSchema(releasesFormats),
    [releasesFormats],
  );

  const [form, setForm] = useState<AddReleaseFormDraft>(
    initialAddReleaseFormDraftValue(originalReleaseDate),
  );

  const [fieldErrors, setFieldErrors] = useState<AddReleaseFormFieldErrors>({});

  const [notifications, setNotifications] =
    useState<AddReleaseFormFieldNotifications>({});

  const [printedInCountriesSectionOpen, setPrintedInCountriesSectionOpen] =
    useState(false);

  const setFieldValue = <K extends "releaseVersion" | "releaseDate">(
    key: K,
    value: AddReleaseFormDraft[K]["value"],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
  };

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
    if (!errorMessages) {
      return {};
    }

    return {
      releaseDate: getReleaseDateFormFieldErrors(errorMessages),
      formats: getFormatsFormFieldErrors(errorMessages, form.formats),
      releaseVersion: errorMessages
        .filter(({ path }) => path[0] === "releaseVersion")
        .map(({ message }) => ({ message })),
      matrixRunout: errorMessages
        .filter(({ path }) => path[0] === "matrixRunout")
        .map(({ message }) => ({ message })),
      catalogueNumbers: getCaNumbersFormFieldErrors(
        errorMessages,
        form.catalogueNumbers,
      ),
      countries: getCountriesFormFieldErrors(
        errorMessages,
        form.countries.madeIn,
        form.countries.printedIn,
      ),
    };
  };

  // on focus we attempt to remove errors related to the field that is being focused
  const onFocus = (key: AddReleaseFormInputFieldKey) => {
    if (key === "releaseVersion") {
      setNotifications((prev) => omitProperty(prev, key));
    }

    setFieldErrors((prev) => {
      if (isFormatInputFieldKey(key)) {
        const { formats } = prev;
        const { formatRowId, field } = key;

        const nextFormatRowErrors = prev.formats?.[formatRowId]?.filter(
          (error) =>
            error.sources &&
            error.sources.length > 0 &&
            !error.sources.includes(field),
        );

        return {
          ...prev,
          formats: {
            ...formats,
            [formatRowId]: nextFormatRowErrors,
          },
        };
      }

      if (isCatalogueNumbersInputFieldKey(key)) {
        const { catalogueNumbers } = prev;
        const { catNumberRowId, field, inputValueId } = key;

        const rowErrors = catalogueNumbers?.[catNumberRowId];
        const errorKey =
          field === "label"
            ? "labelInputErrorMessages"
            : "catNumberInputErrorMessages";

        const nextRowErrors = {
          ...rowErrors,
          [errorKey]: omitProperty(rowErrors?.[errorKey], inputValueId),
        };

        return {
          ...prev,
          catalogueNumbers: {
            ...catalogueNumbers,
            [catNumberRowId]: nextRowErrors,
          },
        };
      }

      const errorKey = isReleaseDateInputFieldKey(key) ? "releaseDate" : key;

      const errors = prev[errorKey]?.filter(
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

  const validateField = <K extends "releaseVersion" | "releaseDate">(
    key: K,
  ) => {
    const formFieldData = form[key];

    // Correlated union: TS can't see that `value` and `validationFn`'s parameter
    // share the same K, so we narrow the call signature locally. Sound because
    // both fields come from the same `form[key]` instance.
    type Value = AddReleaseFormDraft[K]["value"];
    type Result = ReturnType<AddReleaseFormDraft[K]["validationFn"]>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const validationFn = formFieldData.validationFn as (v: Value) => Result;
    const validationResult = validationFn(formFieldData.value);
    const { valid, value } = validationResult;

    setField(key, (prev) => ({ ...prev[key], valid, value }));

    if (!validationResult.valid) {
      setFieldErrors((prev) => ({
        ...prev,
        [key]: validationResult.errorMessages,
      }));
    }

    return validationResult;
  };

  const validateReleaseVersionField = () => {
    const validationResult = validateField("releaseVersion");

    if (validationResult.valid) {
      setNotifications((prev) => ({
        ...prev,
        releaseVersion: validationResult.notifications,
      }));
    }

    return validationResult;
  };

  const validateReleaseDateFields = () => validateField("releaseDate");

  type onBlurKey =
    | Exclude<keyof AddReleaseFormDraft, "catalogueNumbers">
    | UpdateCatNumberFieldErrorsArgs;

  const onBlur = (key: onBlurKey) => {
    if (key === "releaseVersion") {
      return validateReleaseVersionField();
    }

    if (key === "releaseDate") {
      return validateReleaseDateFields();
    }

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

    return undefined;
  };

  const addFormatRow = () => {
    setField("formats", (prev) => [...prev.formats, defaultFormatInputRow()]);
  };

  const removeFormatRow = (rowId: string) => {
    // if we remove format row, we should also remove errors associated with it
    setFieldErrors((prev) => ({
      ...prev,
      formats: omitProperty(prev.formats, rowId),
    }));

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

  const removeCatalogueNumbersRow = (rowId: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      catalogueNumbers: omitProperty(prev.catalogueNumbers, rowId),
    }));

    setField("catalogueNumbers", (prev) =>
      prev.catalogueNumbers.filter((row) => row.id !== rowId),
    );
  };

  const addSelectedTag = (tagId: string, tag: string) => {
    setField("selectedTags", (prev) => ({
      ...prev.selectedTags,
      [tagId]: tag,
    }));
  };

  const removeSelectedTag = (tagId: string) => {
    setField("selectedTags", (prev) => omitProperty(prev.selectedTags, tagId));
  };

  const addCountrySelectionRow = () => {
    setField("countries", (prev) => ({
      ...prev.countries,
      madeIn: [...prev.countries.madeIn, emptyCountrySelection()],
    }),
    );
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

      if (nextCountries === undefined) {
        if (prev.countries === undefined) {
          return prev;
        }

        return omitProperty(prev, "countries");
      }

      return { ...prev, countries: nextCountries };
    });

    setField("countries", (prev) => ({
      ...prev.countries,
      madeIn: prev.countries.madeIn.filter((row) => row.id !== inputId),
    }));
  };

  const clearAllCountries = () => {
    setPrintedInCountriesSectionOpen(false);
    setFieldErrors((prev) => omitProperty(prev, "countries"));
    setField("countries", (prev) => ({
      ...prev.countries,
      madeIn: [],
      printedIn: [],
    }));
  };

  const setCountrySelectionCodeName = (inputId: string, codeName: string) => {
    setField("countries", (prev) => ({
      ...prev.countries,
      madeIn: prev.countries.madeIn.map((row) =>
        row.id === inputId ? { ...row, codeName } : row,
      ),
    }));
  };

  const openPrintedInCountriesSection = () => {
    setPrintedInCountriesSectionOpen(true);
    setField("countries", (prev) => ({
      ...prev.countries,
      printedIn: [...prev.countries.printedIn, emptyCountrySelection()],
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

      if (nextCountries === undefined) {
        if (prev.countries === undefined) {
          return prev;
        }

        return omitProperty(prev, "countries");
      }

      return { ...prev, countries: nextCountries };
    });
    setField("countries", (prev) => ({
      ...prev.countries,
      printedIn: [],
    }));
  };

  const addPrintedInCountrySelectionRow = () => {
    setField("countries", (prev) => ({
      ...prev.countries,
      printedIn: [...prev.countries.printedIn, emptyCountrySelection()],
    }));
  };

  const removePrintedInCountrySelectionRow = (inputId: string) => {
    setField("countries", (prev) => ({
      ...prev.countries,
      printedIn: prev.countries.printedIn.filter((row) => row.id !== inputId),
    }));
  };

  const setPrintedInCountrySelectionCodeName = (
    inputId: string,
    codeName: string,
  ) => {
    setField("countries", (prev) => ({
      ...prev.countries,
      printedIn: prev.countries.printedIn.map((row) =>
        row.id === inputId ? { ...row, codeName } : row,
      ),
    }));
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
      countries,
    } = form;

    validateReleaseVersionField();
    validateReleaseDateFields();

    const dataToValidate = {
      matrixRunout,
      formats,
      catalogueNumbers: catalogueNumbers.map((row) => ({
        labelInputValues: row.labelInputValues.map((label) => label.name),
        catalogueNumberInputValues: row.catalogueNumberInputValues.map(
          (catNumber) => catNumber.value,
        ),
      })),
      countries: {
        madeIn: countries.madeIn.map((c) => c.codeName),
        printedIn: countries.printedIn.map((c) => c.codeName),
      },
    };

    const result = validateAgainstSchema(addReleaseFormSchema, dataToValidate);

    const formIsValid =
      releaseVersion.valid && releaseDate.valid && result.success;

    console.info({
      form,
      formIsValid,
      result,
      selectedTags: Object.entries(selectedTags),
      countries: countries.madeIn.map((c) => c.codeName),
      printedIn: countries.printedIn.map((c) => c.codeName),
    });

    if (!result.success) {
      setFieldErrors(getFieldErrorsPatch(result.errorMessages));

      return;
    }

    setFieldErrors({});
  };

  const releaseVersionErrors = fieldErrors.releaseVersion ?? [];
  const releaseVersionNotifications = notifications.releaseVersion ?? [];
  const matrixRunoutErrors = fieldErrors.matrixRunout ?? [];
  const releaseDateErrors = fieldErrors.releaseDate ?? [];
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
          countries={countries}
          countrySelections={form.countries.madeIn}
          onSetCountryCodeName={setCountrySelectionCodeName}
          onAddRow={addCountrySelectionRow}
          onRemoveRow={removeCountrySelectionRow}
          heading="Countries"
          selectIdPrefix="add-release-country"
          rowLabelPrefix="Country"
          removeRowAriaLabel="Remove country row"
          onRemove={clearAllCountries}
          removeAriaLabel="Remove all countries and printed-in countries"
          errors={fieldErrors.countries?.madeIn}
        />

        {printedInCountriesSectionOpen ? (
          <AddReleaseCountriesSection
            countries={countries}
            countrySelections={form.countries.printedIn}
            onSetCountryCodeName={setPrintedInCountrySelectionCodeName}
            onAddRow={addPrintedInCountrySelectionRow}
            onRemoveRow={removePrintedInCountrySelectionRow}
            heading="Printed in countries"
            selectIdPrefix="add-release-printed-in-country"
            rowLabelPrefix="Printed-in country"
            removeRowAriaLabel="Remove printed-in country row"
            onRemove={closePrintedInCountriesSection}
            removeAriaLabel='Remove "printed in" countries section'
            errors={fieldErrors.countries?.printedIn}
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
          formatInputs={form.formats}
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
          <button type="submit" onMouseDown={(e) => e.preventDefault()}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReleaseForm;
