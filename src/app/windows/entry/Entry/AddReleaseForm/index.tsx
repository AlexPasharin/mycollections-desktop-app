import { useState, type FC, type FormEvent } from "react";

import styles from "./AddReleaseForm.module.css";

import {
  getReleaseFormFieldErrors,
  getReleaseFormFieldErrorMessage,
  addReleaseFormInitialValues,
  addReleaseFormSchema,
  type AddReleaseFormFieldKey,
  type AddReleaseFormInput,
} from "@/validation/releases/addReleaseForm";

type AddReleaseFormProps = {
  onCancel: () => void;
};

const AddReleaseForm: FC<AddReleaseFormProps> = ({ onCancel }) => {
  const [form, setForm] = useState<AddReleaseFormInput>(
    addReleaseFormInitialValues,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string | undefined>
  >({});

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
          />
          {releaseVersionError && (
            <p id="add-release-version-error" className={styles.fieldError}>
              {releaseVersionError}
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
