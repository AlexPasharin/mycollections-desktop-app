import type { FC } from "react";

import styles from "./FormFieldNotifications.module.css";

export type FormFieldNotificationsProps = {
  id: string;
  messages: { notification: string }[] | undefined;
};

const FormFieldNotifications: FC<FormFieldNotificationsProps> = ({
  id,
  messages,
}) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div id={id} className={styles.root} role="status">
      {messages.map((item, index) => (
        <p
          key={`${item.notification}-${String(index)}`}
          className={styles.line}
        >
          {item.notification}
        </p>
      ))}
    </div>
  );
};

export default FormFieldNotifications;
