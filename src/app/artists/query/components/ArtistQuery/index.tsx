import { useState, type FC } from "react";

const ArtistQuery: FC = () => {
  const [artistQuery, setArtistQuery] = useState("");

  console.info({ artistQuery });

  return (
    <>
      <h2>Find artist</h2>
      <input
        value={artistQuery}
        onChange={(e) => setArtistQuery(e.target.value)}
      />
    </>
  );
};

export default ArtistQuery;
