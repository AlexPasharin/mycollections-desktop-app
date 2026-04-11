import { useMemo, useState, type FC, type FormEvent } from "react";

import styles from "./AddReleaseForm.module.css";
import AddReleaseFormFormatsSection from "./AddReleaseFormFormatsSection";
import {
  getFormatsFormFieldErrors,
  getReleaseDateFormFieldErrors,
  initialAddReleaseFormDraftValue,
  isFormatInputFieldKey,
  isReleaseDateInputFieldKey,
  type AddReleaseFormDraft,
  type AddReleaseFormEntry,
  type AddReleaseFormFieldErrors,
  type AddReleaseFormInputFieldKey,
} from "./addReleaseFormUtils";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import GeneralizedDateFormInput from "@/app/components/GeneralizedDateFormInput";
import type { ReleasesFormatListItem } from "@/types/formats";
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
          (error) => !error.sources?.includes(field),
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

      if (isReleaseDateInputFieldKey(key)) {
        const releaseDateErrors = prev.releaseDate?.filter(
          (error) => !error.sources?.includes(key),
        );

        return {
          ...prev,
          releaseDate:
            releaseDateErrors && releaseDateErrors.length > 0
              ? releaseDateErrors
              : undefined,
        };
      }

      return {
        ...prev,
        [key]: undefined,
      };
    });
  };

  const onBlur = (key: keyof AddReleaseFormDraft) => {
    setFieldErrors((prev) => {
      const errorMessages = getFieldValidationErrorMessages(
        addReleaseFormSchema,
        key,
        form[key],
      );

      return {
        ...prev,
        ...getFieldErrorsPatch(errorMessages),
      };
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = validateAgainstSchema(addReleaseFormSchema, form);

    console.info({ form, result });

    if (!result.success) {
      setFieldErrors(getFieldErrorsPatch(result.errorMessages));

      return;
    }

    setFieldErrors({});
    console.info("submitting! (not really)", result.data);
  };

  const releaseVersionErrors = fieldErrors.releaseVersion ?? [];
  const releaseDateErrors = fieldErrors.releaseDate ?? [];
  const hasReleaseVersionErrors = releaseVersionErrors.length > 0;
  const hasReleaseDateErrors = releaseDateErrors.length > 0;

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

        <div className={styles.field}>
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

        <AddReleaseFormFormatsSection
          formats={form.formats}
          releasesFormats={releasesFormats}
          formatsFieldErrors={fieldErrors.formats}
          setFormats={(stateUpdateFn) =>
            setField("formats", (prev) => stateUpdateFn(prev.formats))
          }
          onFieldFocus={onFocus}
          onBlur={() => onBlur("formats")}
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
