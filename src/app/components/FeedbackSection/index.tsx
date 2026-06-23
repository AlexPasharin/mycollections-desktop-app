import type { FC } from "react";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import type { FormFeedback } from "@/types/form";

type FeedbackSectionProps = {
  notificationsId: string;
  errorsId: string;
  feedback: FormFeedback;
};

const FeedbackSection: FC<FeedbackSectionProps> = ({
  notificationsId,
  errorsId,
  feedback,
}) => (
  <>
    <FormFieldNotifications
      id={notificationsId}
      messages={feedback.notifications.map((notification) => ({
        notification,
      }))}
    />
    <FormFieldErrorMessages
      id={errorsId}
      messages={feedback.errors.map((message) => ({ message }))}
    />
  </>
);

export default FeedbackSection;
