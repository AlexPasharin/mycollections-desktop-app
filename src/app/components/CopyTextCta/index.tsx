import { useState, type FC } from "react";

import Icon from "@/app/components/Icon";
import checkIcon from "@/assets/icons/check.svg";
import copyToClipboardIcon from "@/assets/icons/copy-to-clipboard.svg";
import crossIcon from "@/assets/icons/cross.svg";

export type CopyTextCtaProps = {
  text: string;
  label: string;
  successMessage: string;
  errorMessage: string;
};

type FeedbackState = "success" | "error";

const copyTextCtaClassName =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#bcbcbc] bg-white px-[0.6rem] py-[0.35rem] text-[0.92em] text-[#333] hover:bg-[#f1f1f1]";

const copyTextCtaContainerClassName = "mt-2 flex flex-wrap items-center gap-2";

const CopyTextCta: FC<CopyTextCtaProps> = ({
  text,
  label,
  successMessage,
  errorMessage,
}) => {
  const [feedback, setFeedback] = useState<FeedbackState>();

  const handleClick = () => {
    setFeedback(undefined);

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setFeedback("success");
      })
      .catch((error: unknown) => {
        console.error(error);
        setFeedback("error");
      });
  };

  return (
    <div className={copyTextCtaContainerClassName}>
      <button
        type="button"
        className={copyTextCtaClassName}
        onClick={handleClick}
      >
        <Icon src={copyToClipboardIcon} />
        {label}
      </button>

      {feedback === "success" && (
        <span className="inline-flex items-center gap-1 text-[0.92em] text-green-700">
          <Icon src={checkIcon} />
          {successMessage}
        </span>
      )}

      {feedback === "error" && (
        <span className="inline-flex items-center gap-1 text-[0.92em] text-red-700">
          <Icon src={crossIcon} />
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default CopyTextCta;
