import { useEffect, useState, type FC } from "react";

import CreateArtistSuccess from "./CreateArtistSuccess";

import api from "../../api";

import ArtistUpsertForm from "@/app/components/ArtistUpsertForm";
import FeedbackSection from "@/app/components/FeedbackSection";
import type { DbSource } from "@/db/db-source";
import type { ArtistByIdResult } from "@/types/artists";
import type { FormFeedback } from "@/types/form";
import { formFeedbackInitialValue } from "@/utils/form";

type CreateArtistProps = {
  primaryDbSource: DbSource;
};

const CREATE_ARTIST_NOTIFICATIONS_ID = "main-create-artist-notifications";
const CREATE_ARTIST_ERRORS_ID = "main-create-artist-errors";

const CreateArtist: FC<CreateArtistProps> = ({ primaryDbSource }) => {
  const [createArtistFeedback, setCreateArtistFeedback] =
    useState<FormFeedback>(formFeedbackInitialValue);
  const [savedArtist, setSavedArtist] = useState<ArtistByIdResult | null>(null);

  const handleClearFeedback = () => {
    setCreateArtistFeedback(formFeedbackInitialValue);
  };

  useEffect(() => {
    handleClearFeedback();
    setSavedArtist(null);
  }, [primaryDbSource]);

  const handleArtistSaved = (result: {
    artist: ArtistByIdResult;
    feedback: FormFeedback;
  }) => {
    setSavedArtist(result.artist);
    setCreateArtistFeedback(result.feedback);
  };

  return (
    <>
      <FeedbackSection
        notificationsId={CREATE_ARTIST_NOTIFICATIONS_ID}
        errorsId={CREATE_ARTIST_ERRORS_ID}
        notifications={createArtistFeedback.notifications}
        errors={createArtistFeedback.errors}
      />
      {savedArtist ? (
        <CreateArtistSuccess
          artist={savedArtist}
          primaryDbSource={primaryDbSource}
          onCreateAnother={() => {
            setSavedArtist(null);
            setCreateArtistFeedback(formFeedbackInitialValue);
          }}
        />
      ) : (
        <ArtistUpsertForm
          mode="create"
          primaryDbSource={primaryDbSource}
          createArtist={api.createArtist}
          onClearFeedback={handleClearFeedback}
          onArtistSaved={handleArtistSaved}
        />
      )}
    </>
  );
};

export default CreateArtist;
