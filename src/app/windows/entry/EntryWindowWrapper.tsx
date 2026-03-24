import type { FC } from "react";

const EntryWindowWrapper: FC = () => {
  const params = new URLSearchParams(window.location.search);
  const entryId = params.get("entryId");

  if (!entryId) {
    const error = new Error("entryId is required");
    console.error(error);
    window.close();

    return null;
  }

  return (
    <div>
      <h1>Entry</h1>
      <p>Entry ID: {entryId}</p>
    </div>
  );
};

export default EntryWindowWrapper;
