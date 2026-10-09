 import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { seedIfEmpty } from "./storage.js";
import "./styles.css";

seedIfEmpty();
createRoot(document.getElementById("root")).render(<App />);
