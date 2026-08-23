import type { FC } from "react";

import RelatedArtistsFormSection, {
  type RelatedArtistsFormSectionLabels,
} from "./RelatedArtistsFormSection";

import type { ArtistUpsertRelatedArtistRow } from "../artistUpsertFormUtils/formValues";

import type { RelatedItemRelation } from "@/types/common";
import type { FeedbackNotifications, FormFieldError } from "@/types/form";

type ArtistUpsertRelatedArtistsSectionProps = {
  relatedArtists: ArtistUpsertRelatedArtistRow[];
  errors: Record<string, FormFieldError[]>;
  notifications: FeedbackNotifications;
  onChangeArtistId: (rowId: string, artistId: string) => void;
  onChangeRelation: (rowId: string, relation: RelatedItemRelation | "") => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onFocus: (rowId: string) => void;
  onBlur: () => void;
};

const ArtistUpsertRelatedArtistsSection: FC<
  ArtistUpsertRelatedArtistsSectionProps
> = ({
  relatedArtists,
  errors,
  notifications,
  onChangeArtistId,
  onChangeRelation,
  onAddRow,
  onRemoveRow,
  onFocus,
  onBlur,
}) => (
  <RelatedArtistsFormSection
    rows={relatedArtists}
    getRelatedId={(row) => row.artistId}
    errors={errors}
    notifications={notifications}
    labels={ARTIST_RELATED_ARTISTS_LABELS}
    onChangeRelatedId={onChangeArtistId}
    onChangeRelation={onChangeRelation}
    onAddRow={onAddRow}
    onRemoveRow={onRemoveRow}
    onFocus={onFocus}
    onBlur={onBlur}
  />
);

export default ArtistUpsertRelatedArtistsSection;

const ARTIST_RELATED_ARTISTS_LABELS: RelatedArtistsFormSectionLabels = {
  sectionTitle: "Related artists",
  listAriaLabel: "Related parent or child artists",
  relatedIdLabel: "Artist ID",
  relatedIdPlaceholder: "Artist ID",
  removeItemAriaLabel: (index) => `Remove related artist ${index + 1}`,
  addRowButtonLabel: "Add related artist",
  notificationsId: "upsert-artist-related-artists-notifications",
  rowIdPrefix: "upsert-artist-related-artist",
};
