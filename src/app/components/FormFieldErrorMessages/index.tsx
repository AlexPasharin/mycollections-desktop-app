import type { FC } from "react";

export type FormFieldErrorMessagesProps = {
  id: string;
  messages: { message: string }[] | undefined;
};

const FormFieldErrorMessages: FC<FormFieldErrorMessagesProps> = ({
  id,
  messages,
}) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div id={id} className="flex flex-col gap-[0.2rem]" role="alert">
      {messages.map((item, index) => (
        <p
          key={`${item.message}-${String(index)}`}
          className="m-0 text-[0.85em] text-[#b42318]"
        >
          {item.message}
        </p>
      ))}
    </div>
  );
};

export default FormFieldErrorMessages;
