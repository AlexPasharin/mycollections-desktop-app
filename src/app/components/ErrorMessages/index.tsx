import type { FC } from "react";

import Messages from "@/app/components/Messages";

export type ErrorMessagesProps = {
  id: string;
  messages: { message: string }[] | undefined;
};

const ErrorMessages: FC<ErrorMessagesProps> = ({ id, messages }) => (
  <Messages
    id={id}
    texts={messages?.map((item) => item.message)}
    variant="error"
  />
);

export default ErrorMessages;
