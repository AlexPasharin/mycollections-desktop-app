import type { FC } from "react";

import api from "../../../api";

import type { DbSource } from "@/db/db-source";
import type { ArtistByIdResult } from "@/types/artists";

type CreateArtistSuccessProps = {
  artist: ArtistByIdResult;
  primaryDbSource: DbSource;
  onCreateAnother: () => void;
};

const actionButtonClassName =
  "cursor-pointer rounded-md border border-indigo-600 bg-indigo-600 px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-white transition-[background,border-color] duration-150 ease-in-out hover:border-indigo-700 hover:bg-indigo-700";

const CreateArtistSuccess: FC<CreateArtistSuccessProps> = ({
  artist,
  primaryDbSource,
  onCreateAnother,
}) => (
  <div className="mt-4" role="status">
    <p className="m-0 text-xl font-bold">
      Artist &quot;{artist.name}&quot; successfully created!
    </p>
    <div className="mt-4 flex flex-wrap gap-3">
      <button
        type="button"
        className={actionButtonClassName}
        onClick={() => {
          api.openNewArtistWindow({
            artistId: artist.artistId,
            source: primaryDbSource,
          });
        }}
      >
        Open window for new artist
      </button>
      <button
        type="button"
        className="cursor-pointer rounded-md border border-[#bcbcbc] bg-white px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-[#333] transition-[background,border-color] duration-150 ease-in-out hover:bg-[#f1f1f1]"
        onClick={onCreateAnother}
      >
        Create another artist
      </button>
    </div>
  </div>
);

export default CreateArtistSuccess;
