import { createRoot } from "react-dom/client";

import EntryWindowWrapper from "./EntryWindowWrapper";

import "@/styles/index.css";
import "@/styles/tailwind.css";

const root = createRoot(document.body);
root.render(<EntryWindowWrapper />);
