import type { FC } from "react";

export type MessagesVariant = "error" | "notification";

export type MessagesProps = {
  id: string;
  texts: string[] | undefined;
  variant: MessagesVariant;
};

const variantTextClassName: Record<MessagesVariant, string> = {
  error: "m-0 text-[0.85em] text-[#b42318]",
  notification: "m-0 text-[0.85em] text-[#2f7d32]",
};

const Messages: FC<MessagesProps> = ({ id, texts, variant }) => {
  if (!texts || texts.length === 0) {
    return null;
  }

  const textClassName = variantTextClassName[variant];

  return (
    <div
      id={id}
      className="flex flex-col gap-[0.2rem]"
      role={variant === "error" ? "alert" : "status"}
    >
      {texts.map((text, index) => (
        <p key={`${text}-${String(index)}`} className={textClassName}>
          {text}
        </p>
      ))}
    </div>
  );
};

export default Messages;
