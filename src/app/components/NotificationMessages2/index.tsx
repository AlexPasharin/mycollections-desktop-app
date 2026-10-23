import type { FC } from "react";

import Messages from "@/app/components/Messages";
import type { FormFeedbackMessages } from "@/hooks/useFormState";

export type NotificationMessagesProps = {
  id: string;
  messages: FormFeedbackMessages;
};

const NotificationMessages2: FC<NotificationMessagesProps> = ({
  id,
  messages,
}) => (
  <Messages
    id={id}
    texts={messages.map((item) => item.message)}
    variant="notification"
  />
);

export default NotificationMessages2;
