import { useEffect, useId, useRef, type FC, type ReactNode } from "react";

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

const cardBaseClassName =
  "flex w-full flex-col gap-[0.85rem] rounded-[10px] border border-[#e0dcf5] bg-white px-[1.4rem] pb-[1.1rem] pt-5 shadow-[0_14px_40px_rgba(15,23,42,0.25),0_2px_6px_rgba(15,23,42,0.1)]";

const buttonBaseClassName =
  "cursor-pointer rounded-md border border-transparent px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium transition-[background,color,border-color] duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-60";

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
      ? `${buttonBaseClassName} border-red-600 bg-red-600 text-white hover:enabled:border-red-700 hover:enabled:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800`
      : `${buttonBaseClassName} border-indigo-600 bg-indigo-600 text-white hover:enabled:border-indigo-700 hover:enabled:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700`;

  const cardClassName =
    size === "wide"
      ? `${cardBaseClassName} max-h-[85vh] max-w-[52rem]`
      : `${cardBaseClassName} max-w-md`;

  const descriptionClassName =
    size === "wide"
      ? "m-0 min-h-0 flex-1 overflow-y-auto pr-[0.4rem] text-[0.95rem] leading-[1.4] text-gray-700"
      : "m-0 text-[0.95rem] leading-[1.4] text-gray-700";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-5"
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
        <h2
          id={titleId}
          className="m-0 text-[1.05rem] font-semibold text-gray-800"
        >
          {title}
        </h2>
        {description && (
          <div id={descriptionId} className={descriptionClassName}>
            {description}
          </div>
        )}
        {errorMessage && (
          <p className="m-0 text-[0.88rem] text-red-700">{errorMessage}</p>
        )}
        <div className="mt-1 flex justify-end gap-[0.55rem]">
          <button
            ref={cancelRef}
            type="button"
            className={`${buttonBaseClassName} border-gray-300 bg-gray-100 text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 hover:enabled:bg-gray-200`}
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
