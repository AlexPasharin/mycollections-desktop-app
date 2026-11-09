import type { FC } from "react";

import ErrorMessages from "@/app/components/ErrorMessages";
import NotificationMessages from "@/app/components/NotificationMessages";
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
  <div className="flex flex-col gap-[0.2rem]">
    <NotificationMessages id={notificationsId} messages={notifications} />
    <ErrorMessages id={errorsId} messages={errors} />
  </div>
);

export default FeedbackSection;
