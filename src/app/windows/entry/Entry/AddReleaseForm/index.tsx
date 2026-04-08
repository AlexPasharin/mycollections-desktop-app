import { useEffect, useMemo, useState, type FC, type FormEvent } from "react";

import styles from "./AddReleaseForm.module.css";
import AddReleaseFormFormatsSection from "./AddReleaseFormFormatsSection";
import type { AddReleaseFormFormatInput } from "./AddReleaseFormFormatsSection/index";

import GeneralizedDateFormInput, {
  type GeneralizedDateFormInputValue,
} from "@/app/components/GeneralizedDateFormInput";
import api from "@/app/windows/entry/api";
import { SEVEN_INCH_FORMAT_SHORT_NAME } from "@/constants";
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
  formats: AddReleaseFormFormatInput[];
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

const defaultFormatRow = (): AddReleaseFormFormatInput => ({
  formatId: "",
  amount: "1",
  pictureSleeve: true,
  jukeboxHole: false,
});

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
    formats: [defaultFormatRow()],
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrorsDict>({});

  const [releasesFormats, setReleasesFormats] = useState<
    ReleasesFormatListItem[]
  >([]);

  useEffect(() => {
    api.fetchReleasesFormats().then(setReleasesFormats).catch(console.error);
  }, []);

  const row = form.formats[0] ?? defaultFormatRow();

  const setField = <K extends AddReleaseFormDraftKey>(
    key: K,
    value: AddReleaseFormDraft[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const patchFormat0 = (patch: Partial<AddReleaseFormFormatInput>) => {
    setForm((prev) => ({
      ...prev,
      formats: [{ ...(prev.formats[0] ?? defaultFormatRow()), ...patch }],
    }));
  };

  const onFormatChange = (formatId: string) => {
    setForm((prev) => {
      const current = prev.formats[0] ?? defaultFormatRow();
      const fmt = releasesFormats.find((f) => f.formatId === formatId);
      const isSevenInch = fmt?.shortName === SEVEN_INCH_FORMAT_SHORT_NAME;

      return {
        ...prev,
        formats: [
          {
            ...current,
            formatId,
            jukeboxHole: isSevenInch ? current.jukeboxHole : false,
          },
        ],
      };
    });
  };

  const onFocus = (key: FieldValidationKey) => {
    setFieldErrors((prev) => {
      const errorKey =
        key === "year" || key === "month" || key === "day"
          ? "releaseDate"
          : key;

      const { [errorKey]: fieldError, ...rest } = prev;

      if (!fieldError || fieldError.source !== key) {
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
  const formatSectionDisabled = !row.formatId;

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

        <AddReleaseFormFormatsSection
          row={row}
          releasesFormats={releasesFormats}
          formatSectionDisabled={formatSectionDisabled}
          onFormatChange={onFormatChange}
          patchFormat={patchFormat0}
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
