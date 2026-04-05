import { useEffect, useState, type FC, type FormEvent } from "react";

import styles from "./AddReleaseForm.module.css";

import GeneralizedDateFormInput from "@/app/components/GeneralizedDateFormInput";
import { parseGeneralizedDateString } from "@/utils/date";
import { createGeneralizedDateSchema } from "@/validation/generalizedDate";
import {
  getReleaseFormFieldErrors,
  getReleaseFormFieldErrorMessage,
  addReleaseFormInitialValues,
  addReleaseFormSchema,
  type AddReleaseFormFieldKey,
  type AddReleaseFormInput,
} from "@/validation/releases/addReleaseForm";

export { createGeneralizedDateSchema };

const releaseDateSchema = createGeneralizedDateSchema();

type AddReleaseFormProps = {
  onCancel: () => void;
};

const AddReleaseForm: FC<AddReleaseFormProps> = ({ onCancel }) => {
  const [form, setForm] = useState<AddReleaseFormInput>(
    addReleaseFormInitialValues,
  );
  const [releaseDateInput, setReleaseDateInput] = useState("");
  const [releaseDateError, setReleaseDateError] = useState<
    string | undefined
  >();
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});

  useEffect(() => {
    const trimmed = releaseDateInput.trim();

    if (trimmed === "") {
      setReleaseDateError(undefined);

      return;
    }

    const generalized = parseGeneralizedDateString(releaseDateInput);

    if (generalized === null) {
      const message =
        "Use a hyphen-separated date: YYYY, YYYY-MM, or YYYY-MM-DD.";

      setReleaseDateError(message);
      console.warn({ kind: "parse", releaseDateInput, message });

      return;
    }

    const result = releaseDateSchema.safeParse(generalized);

    if (result.success) {
      setReleaseDateError(undefined);
      console.info({ data: result.data });
    } else {
      const message =
        result.error.issues[0]?.message ?? "Invalid release date.";

      setReleaseDateError(message);
      console.warn({ error: result.error });
    }
  }, [releaseDateInput]);

  const setField = <K extends AddReleaseFormFieldKey>(
    key: K,
    value: AddReleaseFormInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearFieldErrorOnFocus = (key: AddReleaseFormFieldKey) => {
    setFieldErrors((prev) => {
      const { [key]: _omit, ...rest } = prev;

      return rest;
    });
  };

  const handleFieldBlur = <K extends AddReleaseFormFieldKey>(
    key: K,
    value: AddReleaseFormInput[K],
  ) => {
    setFieldErrors((prev) => ({
      ...prev,
      [key]: getReleaseFormFieldErrorMessage(key, value),
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = addReleaseFormSchema.safeParse(form);
    setFieldErrors(getReleaseFormFieldErrors(parsed.error));

    if (!parsed.success) {
      return;
    }

    console.info("submitting! (not really)");
  };

  const releaseVersionError = fieldErrors["releaseVersion"];

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
            onFocus={() => clearFieldErrorOnFocus("releaseVersion")}
            onBlur={(e) => handleFieldBlur("releaseVersion", e.target.value)}
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
          <label className={styles.label} htmlFor="add-release-date">
            Release date
          </label>
          <input
            id="add-release-date"
            className={styles.input}
            type="text"
            value={releaseDateInput}
            onChange={(e) => setReleaseDateInput(e.target.value)}
            aria-invalid={Boolean(releaseDateError)}
            aria-describedby={
              releaseDateError ? "add-release-date-error" : undefined
            }
            autoComplete="off"
          />
          {releaseDateError && (
            <p id="add-release-date-error" className={styles.fieldError}>
              {releaseDateError}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <GeneralizedDateFormInput
            year={String(form.releaseDate?.year ?? "")}
            onYearChange={(yearStr) => {
              setForm((prev) => {
                const trimmed = yearStr.trim();

                if (trimmed === "") {
                  return { ...prev, releaseDate: undefined };
                }

                const y = Number(trimmed);

                // if (!Number.isInteger(y) || Number.isNaN(y)) {
                //   return prev;
                // }

                const current = prev.releaseDate;

                return { ...prev, releaseDate: { ...current, year: y } };
              });
            }}
          />
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
