import type { FC } from "react";

import type { ReleaseFormRelatedReleasesErrors } from "../releaseFormUtils/errorMessages";
import type { ReleaseFormRelatedReleaseRow } from "../releaseFormUtils/formValues";

import RelatedItemsFormSection, {
  type RelatedItemsFormSectionLabels,
} from "@/app/components/RelatedItemsFormSection";
import type {
  FeedbackNotifications,
  FormRelatedItemRelation,
} from "@/types/form";

type ReleaseRelatedReleasesSectionProps = {
  relatedReleases: ReleaseFormRelatedReleaseRow[];
  errors: ReleaseFormRelatedReleasesErrors;
  notifications: FeedbackNotifications;
  onChangeReleaseId: (rowId: string, releaseId: string) => void;
  onChangeRelation: (rowId: string, relation: FormRelatedItemRelation) => void;
  onChangeOrderNumber: (rowId: string, orderNumber: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string) => void;
  onBlur: () => void;
};

const ReleaseRelatedReleasesSection: FC<ReleaseRelatedReleasesSectionProps> = ({
  relatedReleases,
  errors,
  notifications,
  onChangeReleaseId,
  onChangeRelation,
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
    notifications={notifications}
    labels={RELEASE_RELATED_ITEMS_LABELS}
    onChangeRelatedId={onChangeReleaseId}
    onChangeRelation={onChangeRelation}
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
  removeItemAriaLabel: (index) => `Remove related release ${index + 1}`,
  addRowButtonLabel: "Add related release",
  notificationsId: "add-release-related-releases-notifications",
  rowIdPrefix: "add-release-related-release",
};
