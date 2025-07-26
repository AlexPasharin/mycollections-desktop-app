import { createRoot } from "react-dom/client";

import MainWindowWrapper from "./MainWindowWrapper";

import "@/styles/index.css";

const root = createRoot(document.body);
root.render(<MainWindowWrapper />);
