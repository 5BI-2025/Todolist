import { loadState } from "./state.js";
import { renderBoard, updateListSelect } from "./render.js";
import { initEvents } from "./events.js";

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  renderBoard();
  updateListSelect();
  initEvents();
});
