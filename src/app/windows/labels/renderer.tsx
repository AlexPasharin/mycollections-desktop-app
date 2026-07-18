import { createRoot } from "react-dom/client";

import LabelsWindowWrapper from "./LabelsWindowWrapper";

import "@/styles/index.css";
import "@/styles/tailwind.css";

const root = createRoot(document.body);
root.render(<LabelsWindowWrapper />);
