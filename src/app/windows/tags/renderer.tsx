import { createRoot } from "react-dom/client";

import TagsWindowWrapper from "./TagsWindowWrapper";

import "@/styles/index.css";
import "@/styles/tailwind.css";

const root = createRoot(document.body);
root.render(<TagsWindowWrapper />);
