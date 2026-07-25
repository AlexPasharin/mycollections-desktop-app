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

const copyTextCtaContainerClassName =
  "mt-2 inline-flex flex-col items-start gap-1";

const feedbackSectionClassName = "inline-flex items-center gap-1 text-[0.92em]";

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

      <FeedbackSection
        feedback={feedback}
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default CopyTextCta;

const FeedbackSection: FC<{
  feedback: FeedbackState | undefined;
  successMessage: string;
  errorMessage: string;
}> = ({ feedback, successMessage, errorMessage }) => {
  if (!feedback) {
    return null;
  }

  const message = feedback === "success" ? successMessage : errorMessage;
  const colorClassName =
    feedback === "success" ? "text-green-700" : "text-red-700";
  const iconSrc = feedback === "success" ? checkIcon : crossIcon;

  return (
    <span className={`${feedbackSectionClassName} ${colorClassName}`}>
      <Icon src={iconSrc} />
      {message}
    </span>
  );
};
