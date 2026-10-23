import type { FC } from "react";

import ErrorMessages from "@/app/components/ErrorMessages";
import NotificationMessages2 from "@/app/components/NotificationMessages2";
import type { FormFeedbackMessages } from "@/hooks/useFormState";

type FeedbackSectionProps = {
  notificationsId: string;
  errorsId: string;
  notifications: FormFeedbackMessages;
  errors: FormFeedbackMessages;
};

const FeedbackSection2: FC<FeedbackSectionProps> = ({
  notificationsId,
  errorsId,
  notifications,
  errors,
}) => (
  <div className="flex flex-col gap-[0.2rem]">
    <NotificationMessages2 id={notificationsId} messages={notifications} />
    <ErrorMessages id={errorsId} messages={errors} />
  </div>
);

export default FeedbackSection2;
