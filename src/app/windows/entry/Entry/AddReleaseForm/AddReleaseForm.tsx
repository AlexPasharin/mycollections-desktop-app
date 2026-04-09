import { useMemo, useState, type FC, type FormEvent } from "react";

import styles from "./AddReleaseForm.module.css";
import AddReleaseFormFormatsSection from "./AddReleaseFormFormatsSection";
import type { AddReleaseFormFormatRowPatch } from "./AddReleaseFormFormatsSection/index";
import {
  defaultFormatInputRow,
  fieldErrorDictKey,
  fieldValidationKeysEqual,
  initialAddReleaseFormDraftValue,
  isFormatFieldValidationKey,
  isReleaseDateFieldValidationKey,
  type AddReleaseFormDraft,
  type AddReleaseFormEntry,
  type FieldErrorsDict,
  type FieldValidationKey,
} from "./addReleaseFormUtils";

import GeneralizedDateFormInput, {
} from "@/app/components/GeneralizedDateFormInput";
import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
import type { ReleasesFormatListItem } from "@/types/formats";
import {
  getZodObjectFieldErrorMessage,
  validateAgainstSchema,
} from "@/utils/validation";
import { createAddReleaseFormSchema } from "@/validation/releases/addReleaseForm";


export type AddReleaseFormProps = {
  entry: AddReleaseFormEntry;
  onCancel: () => void;
  releasesFormats: ReleasesFormatListItem[];
};

const RELEASE_DATE_FIELD_ERROR_ID = "add-release-date-error";
const RELEASE_VERSION_FIELD_ERROR_ID = "add-release-version-error";

const AddReleaseForm: FC<AddReleaseFormProps> = ({
  entry,
  onCancel,
  releasesFormats,
}) => {
  const { originalReleaseDate } = entry;

  const addReleaseFormSchema = useMemo(
    () => createAddReleaseFormSchema(originalReleaseDate),
    [originalReleaseDate],
  );

  const [form, setForm] = useState<AddReleaseFormDraft>(initialAddReleaseFormDraftValue(originalReleaseDate));

  const [fieldErrors, setFieldErrors] = useState<FieldErrorsDict>({});

  const setField = <K extends keyof AddReleaseFormDraft>(
    key: K,
    value: AddReleaseFormDraft[K] | ((prev: AddReleaseFormDraft) => AddReleaseFormDraft[K]),
  ) => {
    setForm((prev) => ({ ...prev, [key]: typeof value === "function" ? value(prev) : value }));
  };

  const patchFormat = (rowId: string, patch: AddReleaseFormFormatRowPatch) => {
    setField("formats", ({ formats }) => formats.map((row) =>
      row.id === rowId ? { ...row, ...patch } : row,
    ));
  };

  const onFormatChange = (rowId: string, formatId: string) => {
    setField("formats", ({ formats }) => {
      const current = formats.find((r) => r.id === rowId);

      if (!current) {
        return formats;
      }

      const fmt = releasesFormats.find((f) => f.formatId === formatId);
      const isSevenInch = fmt?.shortName === SEVEN_INCH_FORMAT_SHORT_NAME;

      return formats.map((row) =>
        row.id === rowId
          ? {
            ...current,
            formatId,
            jukeboxHole: isSevenInch ? current.jukeboxHole : false,
          }
          : row,
      )
    });
  };

  const addFormatRow = () => {
    setField("formats", ({ formats }) => [...formats, defaultFormatInputRow()]);
  };

  const removeFormatRow = (rowId: string) => {
    setField("formats", ({ formats }) => formats.filter((r) => r.id !== rowId));
  };

  const onFocus = (key: FieldValidationKey) => {
    setFieldErrors((prev) => {
      const errorKey = fieldErrorDictKey(key);
      const { [errorKey]: fieldError, ...rest } = prev;

      if (!fieldError || !fieldValidationKeysEqual(fieldError.source, key)) {
        return prev;
      }

      return rest;
    });
  };

  const onBlur = (key: FieldValidationKey) => {
    setFieldErrors((prev) => {
      if (key === "formats") {
        return prev;
      }

      const isReleaseDateField = isReleaseDateFieldValidationKey(key);
      const isFormatField = isFormatFieldValidationKey(key);

      const validationKey = fieldErrorDictKey(key);
      const errorMessage = getZodObjectFieldErrorMessage(
        addReleaseFormSchema,
        validationKey,
        form[validationKey],
      );

      if (!errorMessage) {
        return prev;
      }

      return {
        ...prev,
        [validationKey]: {
          message: errorMessage,
          source: isReleaseDateField || isFormatField ? key : undefined,
        },
      };
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = validateAgainstSchema(addReleaseFormSchema, form);

    console.info({ form });

    if (!result.success) {
      console.info({ result });
      setFieldErrors(result.errorMessages);

      return;
    }

    setFieldErrors({});
    console.info("submitting! (not really)", result.data);
  };

  const releaseVersionError = fieldErrors["releaseVersion"]?.message;
  const releaseDateError = fieldErrors["releaseDate"]?.message;

  return (
    <div className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="add-release-version">
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
            aria-invalid={Boolean(releaseVersionError)}
            aria-describedby={
              releaseVersionError ? RELEASE_VERSION_FIELD_ERROR_ID : undefined
            }
            autoComplete="off"
            required
          />
          {releaseVersionError && (
            <p
              id={RELEASE_VERSION_FIELD_ERROR_ID}
              className={styles.fieldError}
            >
              {releaseVersionError}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <GeneralizedDateFormInput
            date={form.releaseDate}
            startDate={entry.originalReleaseDate}
            setDate={(releaseDate) => setField("releaseDate", releaseDate)}
            onFocus={onFocus}
            onBlur={onBlur}
            invalid={Boolean(releaseDateError)}
            groupErrorId={RELEASE_DATE_FIELD_ERROR_ID}
          />
          {releaseDateError && (
            <p id={RELEASE_DATE_FIELD_ERROR_ID} className={styles.fieldError}>
              {releaseDateError}
            </p>
          )}
        </div>

        <AddReleaseFormFormatsSection
          formats={form.formats}
          releasesFormats={releasesFormats}
          formatsFieldError={fieldErrors.formats}
          onFormatChange={onFormatChange}
          patchFormat={patchFormat}
          onAddFormat={addFormatRow}
          onRemoveFormat={removeFormatRow}
          onFieldFocus={onFocus}
          onFieldBlur={onBlur}
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
