import type { FC } from "react";

import Messages from "@/app/components/Messages";

export type NotificationMessagesProps = {
  id: string;
  messages: { notification: string }[] | undefined;
};

const NotificationMessages: FC<NotificationMessagesProps> = ({
  id,
  messages,
}) => (
  <Messages
    id={id}
    texts={messages?.map((item) => item.notification)}
    variant="notification"
  />
);

export default NotificationMessages;
