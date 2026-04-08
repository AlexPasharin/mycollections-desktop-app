import { useEffect, useMemo, useState, type FC, type FormEvent } from "react";

import styles from "./AddReleaseForm.module.css";

import GeneralizedDateFormInput, {
  type GeneralizedDateFormInputValue,
} from "@/app/components/GeneralizedDateFormInput";
import api from "@/app/windows/entry/api";
import type { GeneralizedDate } from "@/types/date";
import type { EntryByIdResult } from "@/types/entries";
import type { ReleasesFormatListItem } from "@/types/formats";
import {
  getZodObjectFieldErrorMessage,
  validateAgainstSchema,
} from "@/utils/validation";
import { createGeneralizedDateSchema } from "@/validation/generalizedDate";
import { createAddReleaseFormSchema } from "@/validation/releases/addReleaseForm";

export { createGeneralizedDateSchema };

type AddReleaseFormDraft = {
  releaseVersion: string;
  releaseDate: GeneralizedDateFormInputValue;
};

type AddReleaseFormDraftKey = keyof AddReleaseFormDraft;

type FieldErrorsDict = {
  [key in keyof AddReleaseFormDraft]?: key extends "releaseDate"
    ? { message: string; source?: keyof GeneralizedDateFormInputValue }
    : { message: string; source?: undefined };
};

type FieldValidationKey =
  | keyof FieldErrorsDict
  | keyof GeneralizedDateFormInputValue;

type AddReleaseFormEntry = Omit<EntryByIdResult, "originalReleaseDate"> & {
  originalReleaseDate: GeneralizedDate | null;
};

type AddReleaseFormProps = {
  entry: AddReleaseFormEntry;
  onCancel: () => void;
};

const RELEASE_DATE_FIELD_ERROR_ID = "add-release-date-error";

const AddReleaseForm: FC<AddReleaseFormProps> = ({ entry, onCancel }) => {
  const { originalReleaseDate } = entry;

  const addReleaseFormSchema = useMemo(
    () => createAddReleaseFormSchema(originalReleaseDate),
    [originalReleaseDate],
  );

  const [form, setForm] = useState<AddReleaseFormDraft>({
    releaseVersion: "",
    releaseDate: {
      year: String(originalReleaseDate?.year ?? ""),
      month: String(originalReleaseDate?.month ?? ""),
      day: String(originalReleaseDate?.day ?? ""),
    },
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrorsDict>({});

  const [, setReleasesFormats] = useState<ReleasesFormatListItem[]>([]);

  useEffect(() => {
    api.fetchReleasesFormats().then(setReleasesFormats).catch(console.error);
  }, []);

  const setField = <K extends AddReleaseFormDraftKey>(
    key: K,
    value: AddReleaseFormDraft[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onFocus = (key: FieldValidationKey) => {
    setFieldErrors((prev) => {
      const errorKey =
        key === "year" || key === "month" || key === "day"
          ? "releaseDate"
          : key;
      const { [errorKey]: fieldError, ...rest } = prev;

      if (!fieldError || (fieldError.source && fieldError.source !== key)) {
        return prev;
      }

      return rest;
    });
  };

  const onBlur = (key: FieldValidationKey) => {
    setFieldErrors((prev) => {
      const isReleaseDateField =
        key === "year" || key === "month" || key === "day";
      const validationKey = isReleaseDateField ? "releaseDate" : key;
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
          source: isReleaseDateField ? key : undefined,
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
              releaseVersionError ? "add-release-version-error" : undefined
            }
            autoComplete="off"
            required
          />
          {releaseVersionError && (
            <p id="add-release-version-error" className={styles.fieldError}>
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
