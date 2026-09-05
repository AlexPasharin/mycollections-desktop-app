import { type FC, type FocusEvent } from "react";

import type { ReleaseFormMatrixRunoutDraft } from "../releaseFormUtils/formValues";

import FeedbackSection from "@/app/components/FeedbackSection";
import type { FeedbackErrors, FeedbackNotifications } from "@/types/form";

const MATRIX_RUNOUT_FIELD_ERROR_ID = "add-release-matrix-runout-error";
const MATRIX_RUNOUT_FIELD_NOTIFICATIONS_ID =
  "add-release-matrix-runout-notifications";

type ReleaseMatrixRunoutFieldProps = {
  matrixRunout: ReleaseFormMatrixRunoutDraft;
  errorMessages: FeedbackErrors;
  notifications: FeedbackNotifications;
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
    <div
      className="mb-[0.65rem] flex flex-col gap-[0.35rem]"
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <label
        className="m-0 mb-3 text-[1em] leading-[1.35] font-semibold"
        htmlFor="add-release-matrix-runout"
      >
        Matrix / runout
      </label>
      <textarea
        id="add-release-matrix-runout"
        className="min-h-[4.5rem] resize-y px-2 py-[0.35rem] text-[1em] leading-[1.35] [font:inherit]"
        rows={4}
        value={matrixRunout.value}
        onChange={(e) => onValueChange(e.target.value)}
        aria-invalid={hasErrors}
        aria-describedby={describedByIds === "" ? undefined : describedByIds}
        autoComplete="off"
      />
      <div className="mt-[0.15rem] flex items-start gap-2">
        <input
          id="add-release-matrix-runout-plain-text"
          type="checkbox"
          checked={matrixRunout.treatAsText}
          onChange={(e) => onTreatAsTextChange(e.target.checked)}
        />
        <label
          className="m-0 leading-[1.35] font-normal"
          htmlFor="add-release-matrix-runout-plain-text"
        >
          treat as plain text, not json object
        </label>
      </div>
      <FeedbackSection
        notificationsId={MATRIX_RUNOUT_FIELD_NOTIFICATIONS_ID}
        errorsId={MATRIX_RUNOUT_FIELD_ERROR_ID}
        notifications={notifications}
        errors={errorMessages}
      />
    </div>
  );
};

export default ReleaseMatrixRunoutField;
