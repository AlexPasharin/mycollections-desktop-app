import type { FC } from "react";

import type { ReleaseFormRelatedReleaseRow } from "../releaseFormUtils/formValues";

import RelatedItemsFormSection, {
  type RelatedItemsFormSectionLabels,
} from "@/app/components/RelatedItemsFormSection";
import type { FormFeedbackMessages } from "@/types/form";

type ReleaseRelatedReleasesSectionProps = {
  relatedReleases: ReleaseFormRelatedReleaseRow[];
  errors: FormFeedbackMessages;
  notifications: FormFeedbackMessages;
  onChangeReleaseId: (rowId: string, releaseId: string) => void;
  onChangeOrderNumber: (rowId: string, orderNumber: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string, key: "id" | "orderNumber") => void;
  onBlur: () => void;
};

const ReleaseRelatedReleasesSection: FC<ReleaseRelatedReleasesSectionProps> = ({
  relatedReleases,
  errors,
  notifications,
  onChangeReleaseId,
  onChangeOrderNumber,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
}) => (
  <RelatedItemsFormSection
    rows={relatedReleases}
    getRelatedId={(row) => row.releaseId}
    errors={errors}
    notifications={notifications.map(({ message, sources }) => ({
      notification: message,
      sources,
    }))}
    labels={RELEASE_RELATED_ITEMS_LABELS}
    onChangeRelatedId={onChangeReleaseId}
    onChangeOrderNumber={onChangeOrderNumber}
    onAddRow={onAddRow}
    onRemoveRow={onRemoveRow}
    onFocus={onFocus}
    onBlur={onBlur}
  />
);

export default ReleaseRelatedReleasesSection;

const RELEASE_RELATED_ITEMS_LABELS: RelatedItemsFormSectionLabels = {
  sectionTitle: "Related releases",
  listAriaLabel: "Related releases",
  relatedIdLabel: "Release ID",
  relatedIdPlaceholder: "Release ID",
  removeItemAriaLabel: (orderNumber) => `Remove child release ${orderNumber}`,
  addRowButtonLabel: "Add child release",
  notificationsId: "add-release-related-releases-notifications",
  rowIdPrefix: "add-release-related-release",
};
