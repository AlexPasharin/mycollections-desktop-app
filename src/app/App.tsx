import type { FC } from "react";

type Props = {
  artists: { name: string; id: string }[];
};

const App: FC<Props> = ({ artists }) => (
  <>
    <h1>My Collections</h1>
    <ul>
      {artists.map(({ id, name }) => (
        <li key={id}>{name}</li>
      ))}
    </ul>
  </>
);

export default App;
