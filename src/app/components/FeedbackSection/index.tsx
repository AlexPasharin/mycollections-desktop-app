import type { FC } from "react";

import ErrorMessages from "@/app/components/ErrorMessages";
import NotificationMessages from "@/app/components/NotificationMessages";
import type { FormFeedback } from "@/types/form";

type FeedbackSectionProps = {
  notificationsId: string;
  errorsId: string;
  notifications: FormFeedback["notifications"];
  errors: FormFeedback["errors"];
};

const FeedbackSection: FC<FeedbackSectionProps> = ({
  notificationsId,
  errorsId,
  notifications,
  errors,
}) => (
  <>
    <NotificationMessages id={notificationsId} messages={notifications} />
    <ErrorMessages id={errorsId} messages={errors} />
  </>
);

export default FeedbackSection;
