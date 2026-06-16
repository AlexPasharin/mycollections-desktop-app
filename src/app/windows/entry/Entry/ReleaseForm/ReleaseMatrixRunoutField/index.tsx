import { type FC, type FocusEvent } from "react";

import styles from "./ReleaseMatrixRunoutField.module.css";

import type { ReleaseFormMatrixRunoutDraft } from "../releaseFormUtils/formValues";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import type { FormFieldError } from "@/types/form";

const MATRIX_RUNOUT_FIELD_ERROR_ID = "add-release-matrix-runout-error";
const MATRIX_RUNOUT_FIELD_NOTIFICATIONS_ID =
  "add-release-matrix-runout-notifications";

type ReleaseMatrixRunoutFieldProps = {
  matrixRunout: ReleaseFormMatrixRunoutDraft;
  errorMessages: FormFieldError[];
  notifications: { notification: string }[];
  onValueChange: (value: string) => void;
  onTreatAsTextChange: (treatAsText: boolean) => void;
  onFocus: () => void;
  onBlur: () => void;
};

const ReleaseMatrixRunoutField: FC<ReleaseMatrixRunoutFieldProps> = ({
  matrixRunout,
  errorMessages,
  notifications,
  onValueChange,
  onTreatAsTextChange,
  onFocus,
  onBlur,
}) => {
  const hasErrors = errorMessages.length > 0;
  const hasNotifications = notifications.length > 0;

  const describedByIds = [
    hasErrors ? MATRIX_RUNOUT_FIELD_ERROR_ID : null,
    hasNotifications ? MATRIX_RUNOUT_FIELD_NOTIFICATIONS_ID : null,
  ]
    .filter((id): id is string => id !== null)
    .join(" ");

  // The textarea and the "treat as text" checkbox belong to one logical field,
  // so we only invoke the parent's onFocus / onBlur when focus actually crosses
  // the wrapper boundary. Without this, tabbing between the textarea and the
  // checkbox would fire blur → validateField → focus → clear-notifications in
  // immediate succession, wiping the prettified-JSON notification.
  const focusLeftWrapper = (e: FocusEvent<HTMLDivElement>) =>
    !e.currentTarget.contains(e.relatedTarget);

  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (focusLeftWrapper(e)) {
      onFocus();
    }
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (focusLeftWrapper(e)) {
      onBlur();
    }
  };

  return (
    <div className={styles.field} onFocus={handleFocus} onBlur={handleBlur}>
      <label className={styles.heading} htmlFor="add-release-matrix-runout">
        Matrix / runout
      </label>
      <textarea
        id="add-release-matrix-runout"
        className={styles.textarea}
        rows={4}
        value={matrixRunout.value}
        onChange={(e) => onValueChange(e.target.value)}
        aria-invalid={hasErrors}
        aria-describedby={describedByIds === "" ? undefined : describedByIds}
        autoComplete="off"
      />
      <div className={styles.checkboxRow}>
        <input
          id="add-release-matrix-runout-plain-text"
          type="checkbox"
          checked={matrixRunout.treatAsText}
          onChange={(e) => onTreatAsTextChange(e.target.checked)}
        />
        <label
          className={styles.checkboxLabel}
          htmlFor="add-release-matrix-runout-plain-text"
        >
          treat as plain text, not json object
        </label>
      </div>
      <FormFieldErrorMessages
        id={MATRIX_RUNOUT_FIELD_ERROR_ID}
        messages={errorMessages}
      />
      <FormFieldNotifications
        id={MATRIX_RUNOUT_FIELD_NOTIFICATIONS_ID}
        messages={notifications}
      />
    </div>
  );
};

export default ReleaseMatrixRunoutField;
