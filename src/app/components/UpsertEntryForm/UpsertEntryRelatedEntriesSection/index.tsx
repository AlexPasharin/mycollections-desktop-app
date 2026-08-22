import type { FC } from "react";

import type { UpsertEntryRelatedEntriesErrors } from "../upsertEntryFormUtils/errorMessages";
import type { UpsertEntryRelatedEntryRow } from "../upsertEntryFormUtils/formValues";

import RelatedItemsFormSection, {
  type RelatedItemsFormSectionLabels,
} from "@/app/components/RelatedItemsFormSection";
import type { RelatedItemRelation } from "@/types/common";
import type { FeedbackNotifications } from "@/types/form";

type UpsertEntryRelatedEntriesSectionProps = {
  relatedEntries: UpsertEntryRelatedEntryRow[];
  errors: UpsertEntryRelatedEntriesErrors;
  notifications: FeedbackNotifications;
  onChangeEntryId: (rowId: string, entryId: string) => void;
  onChangeRelation: (rowId: string, relation: RelatedItemRelation) => void;
  onChangeOrderNumber: (rowId: string, orderNumber: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string) => void;
  onBlur: () => void;
};

const UpsertEntryRelatedEntriesSection: FC<
  UpsertEntryRelatedEntriesSectionProps
> = ({
  relatedEntries,
  errors,
  notifications,
  onChangeEntryId,
  onChangeRelation,
  onChangeOrderNumber,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
}) => (
  <RelatedItemsFormSection
    rows={relatedEntries}
    getRelatedId={(row) => row.entryId}
    errors={errors}
    notifications={notifications}
    labels={ENTRY_RELATED_ITEMS_LABELS}
    onChangeRelatedId={onChangeEntryId}
    onChangeRelation={onChangeRelation}
    onChangeOrderNumber={onChangeOrderNumber}
    onAddRow={onAddRow}
    onRemoveRow={onRemoveRow}
    onFocus={onFocus}
    onBlur={onBlur}
  />
);

export default UpsertEntryRelatedEntriesSection;

const ENTRY_RELATED_ITEMS_LABELS: RelatedItemsFormSectionLabels = {
  sectionTitle: "Related entries",
  listAriaLabel: "Related entries",
  relatedIdLabel: "Entry ID",
  relatedIdPlaceholder: "Entry ID",
  removeItemAriaLabel: (index) => `Remove related entry ${index + 1}`,
  addRowButtonLabel: "Add related entry",
  notificationsId: "upsert-entry-related-entries-notifications",
  rowIdPrefix: "upsert-entry-related-entry",
};
