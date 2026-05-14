import { useEffect, useId, useRef, type FC, type ReactNode } from "react";

import styles from "./ConfirmDialog.module.css";

type ConfirmDialogTone = "default" | "danger";
type ConfirmDialogSize = "default" | "wide";

export type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  size?: ConfirmDialogSize;
  isBusy?: boolean;
  errorMessage?: string | undefined;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  size = "default",
  isBusy = false,
  errorMessage,
  onConfirm,
  onCancel,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    cancelRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isBusy, onCancel]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isBusy) {
      onCancel();
    }
  };

  const confirmClassName =
    tone === "danger"
      ? `${styles.button} ${styles.confirmDanger}`
      : `${styles.button} ${styles.confirmDefault}`;

  const cardClassName =
    size === "wide" ? `${styles.card} ${styles.cardWide}` : styles.card;
  const descriptionClassName =
    size === "wide"
      ? `${styles.description} ${styles.descriptionScrollable}`
      : styles.description;

  return (
    <div
      className={styles.backdrop}
      onMouseDown={handleBackdropMouseDown}
      role="presentation"
    >
      <div
        className={cardClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && (
          <div id={descriptionId} className={descriptionClassName}>
            {description}
          </div>
        )}
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <div className={styles.actions}>
          <button
            ref={cancelRef}
            type="button"
            className={`${styles.button} ${styles.cancel}`}
            onClick={onCancel}
            disabled={isBusy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmClassName}
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? "Working\u2026" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
