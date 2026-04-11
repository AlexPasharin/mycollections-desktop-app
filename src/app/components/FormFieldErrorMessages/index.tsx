import type { FC } from "react";

import styles from "./FormFieldErrorMessages.module.css";

export type FormFieldErrorMessagesProps = {
  id: string;
  messages: { message: string }[];
};

const FormFieldErrorMessages: FC<FormFieldErrorMessagesProps> = ({
  id,
  messages,
}) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div id={id} className={styles.root} role="alert">
      {messages.map((item, index) => (
        <p key={`${item.message}-${String(index)}`} className={styles.line}>
          {item.message}
        </p>
      ))}
    </div>
  );
};

export default FormFieldErrorMessages;
