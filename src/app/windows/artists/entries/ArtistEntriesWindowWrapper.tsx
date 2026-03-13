import type { FC } from "react";

const ArtistEntriesWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artistId");

  return (
    <>
      <h1>Artist entries</h1>
      {artistId != null && <p>Artist ID: {artistId}</p>}
    </>
  );
};

export default ArtistEntriesWindowWrapper;
