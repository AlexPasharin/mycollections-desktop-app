import type { FC } from "react";

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
    <div id={id} className="flex flex-col gap-[0.2rem]" role="status">
      {messages.map((item, index) => (
        <p
          key={`${item.notification}-${String(index)}`}
          className="m-0 text-[0.85em] text-[#2f7d32]"
        >
          {item.notification}
        </p>
      ))}
    </div>
  );
};

export default FormFieldNotifications;
