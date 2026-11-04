import type { FC } from "react";

import NotificationMessages2 from "../NotificationMessages2";

import ErrorMessages from "@/app/components/ErrorMessages";
import type { FormFeedbackMessages } from "@/types/form";

type FeedbackSectionProps = {
  notificationsId: string;
  errorsId: string;
  notifications: FormFeedbackMessages;
  errors: FormFeedbackMessages;
};

const FeedbackSection: FC<FeedbackSectionProps> = ({
  notificationsId,
  errorsId,
  notifications,
  errors,
}) => (
  <>
    <NotificationMessages2 id={notificationsId} messages={notifications} />
    <ErrorMessages id={errorsId} messages={errors} />
  </>
);

export default FeedbackSection;
