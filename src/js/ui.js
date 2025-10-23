import {
  LISTS,
  STATES,
  todos,
  getP,
  saveLists,
  createList,
  deleteList,
  reorderLists,
  addTodo,
  moveTodo as stateMoveTodo,
  deleteTodo as stateDeleteTodo,
} from "./state.js";

import { initCalendar } from "./calendar.js";
import { el } from "./dom.js";
import { handleDragStart, handleDragEnd } from "./drag.js";
import { createTodoCard } from "./builders.js";

const form = document.getElementById("new-issue-form");
const searchInput = document.getElementById("search");
const filterPriority = document.getElementById("filter-priority");
let columns = {};
const board = document.getElementById("board");
const modal = document.getElementById("modal-new-issue"),
  modalContent = document.getElementById("modal-content"),
  modalOverlay = document.getElementById("modal-overlay");

let renderCalendarFn = null;

function renderColumns() {
  board.innerHTML = "";
  columns = {};
  LISTS.forEach((list) => {
    const colWrap = el("div", {
      cls: "bg-white/60 backdrop-blur-sm rounded-xl shadow-md p-5 flex flex-col min-w-[100px] flex-1 board-column border border-slate-200 hover:shadow-lg transition-all duration-200",
      ds: { state: list.id },
    });
    colWrap.classList.add("hover:border-zinc-300");

    const header = el("div", { cls: "flex justify-between items-center mb-5" });
    const titleWrapper = el("div", { cls: "flex items-center gap-3" });
    const h3 = el("h3", {
      cls: "font-bold text-lg text-slate-700 flex items-center",
      html: `<i class=\"fas fa-list mr-2 text-slate-500\"></i> <span class=\"list-title\">${list.title}</span>`,
    });

    const deleteBtn = el("button", {
      cls: "text-gray-400 hover:text-red-500 transition-colors",
      html: '<i class="fas fa-trash"></i>',
      attrs: { title: "Elimina lista" },
    });

    h3.querySelector(".list-title").addEventListener("click", () => {
      const newTitle = prompt("Nuovo nome lista:", list.title);
      if (newTitle && newTitle.trim()) {
        list.title = newTitle.trim();
        saveLists();
        renderColumns();
        renderBoard();
      }
    });

    header.draggable = true;
    header.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/list", list.id);
      colWrap.classList.add("opacity-60", "scale-105");
    });
    header.addEventListener("dragend", () => {
      colWrap.classList.remove("opacity-60", "scale-105");
    });
    header.addEventListener("dragover", (e) => {
      e.preventDefault();
      header.classList.add("ring-2", "ring-indigo-200");
    });
    header.addEventListener("dragleave", () => {
      header.classList.remove("ring-2", "ring-indigo-200");
    });
    header.addEventListener("drop", (e) => {
      e.preventDefault();
      header.classList.remove("ring-2", "ring-indigo-200");
      const fromId = e.dataTransfer.getData("text/list");
      if (!fromId || fromId === list.id) return;
      reorderLists(fromId, list.id);
      renderColumns();
      renderBoard();
    });

    deleteBtn.addEventListener("click", () => {
      if (
        confirm(
          `Sei sicuro di voler eliminare la lista "${list.title}"?${
            LISTS.length === 1
              ? "\nAttenzione: questa è l'ultima lista, eliminandola verranno rimossi tutti i todo!"
              : ""
          }`
        )
      ) {
        deleteList(list.id);
        renderColumns();
        renderBoard();
      }
    });

    titleWrapper.appendChild(h3);
    titleWrapper.appendChild(deleteBtn);
    header.appendChild(titleWrapper);
    header.appendChild(
      el("span", {
        cls: "bg-slate-200/70 text-slate-600 rounded-full px-3 py-1 text-xs font-semibold",
        text: "0",
        attrs: { id: `${list.id}-count` },
      })
    );

    colWrap.appendChild(header);
    const inner = el("div", {
      cls: "flex-1 flex flex-col gap-4 overflow-y-auto min-h-[300px] max-h-[60vh]",
      attrs: { id: list.id },
    });
    colWrap.appendChild(inner);
    board.appendChild(colWrap);
    columns[list.id] = inner;
  });

  document.querySelectorAll(".board-column").forEach((col) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add(
        "bg-sky-50/50",
        "border-2",
        "border-dashed",
        "border-sky-300"
      );
    });
    col.addEventListener("dragleave", () =>
      col.classList.remove(
        "bg-blue-50",
        "border-2",
        "border-dashed",
        "border-blue-300"
      )
    );
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.classList.remove(
        "bg-blue-50",
        "border-2",
        "border-dashed",
        "border-blue-300"
      );
      const id =
        e.dataTransfer.getData("text/todo") ||
        e.dataTransfer.getData("text/plain");
      const ns = col.dataset.state;
      if (id && todos.find((t) => t.id === id)) moveTodo(id, ns);
    });
  });
}
function renderBoard() {
  STATES.forEach((s) => {
    if (columns[s]) columns[s].innerHTML = "";
  });
  const term = (searchInput.value || "").toLowerCase();
  const pref = filterPriority.value || "all";

  todos
    .filter((i) => {
      const matchText =
        i.title.toLowerCase().includes(term) ||
        (i.description && i.description.toLowerCase().includes(term));
      const matchP = pref === "all" || i.priority === pref;
      return matchText && matchP;
    })
    .forEach((i) => {
      if (columns[i.state])
        columns[i.state].appendChild(
          createTodoCard(i, moveTodo, (id) => {
            stateDeleteTodo(id);
            updateViews();
          })
        );
    });

  updateCounters();
}

function updateCounters() {
  LISTS.forEach((l) => {
    const c = todos.filter((i) => i.state === l.id).length;
    const elc = document.getElementById(`${l.id}-count`);
    if (elc) elc.textContent = c;
  });
}

// Drag handlers moved to ./drag.js

function moveTodo(id, state) {
  stateMoveTodo(id, state);
  updateViews();
}

function updateViews() {
  renderBoard();
  if (
    renderCalendarFn &&
    document.getElementById("calendar-view") &&
    !document.getElementById("calendar-view").classList.contains("hidden")
  ) {
    renderCalendarFn();
  }
}

// Form & modal
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!LISTS.length)
    return alert("Crea prima almeno una lista per aggiungere todo.");
  const title = form.title.value.trim();
  if (!title) return alert("Il titolo è obbligatorio!");
  const newTodo = {
    id: Date.now().toString(),
    title,
    description: form.description.value.trim(),
    priority: form.priority.value || "medium",
    dueDate: form.dueDate.value || null,
    state: LISTS[0].id,
  };
  addTodo(newTodo);
  updateViews();
  form.reset();
  form.title.focus();
  closeModal();
});

searchInput.addEventListener("input", updateViews);
filterPriority.addEventListener("change", updateViews);

function openModal() {
  modal.classList.remove("pointer-events-none");
  setTimeout(() => {
    modal.classList.add("opacity-100");
    modalContent.classList.add("opacity-100", "scale-100");
    modalContent.classList.remove("scale-95");
    form.querySelector("#title").focus();
  }, 10);
}

function closeModal() {
  modal.classList.remove("opacity-100");
  modalContent.classList.remove("opacity-100", "scale-100");
  modalContent.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("pointer-events-none");
    form.reset();
  }, 300);
}

document
  .getElementById("toggle-new-issue")
  .addEventListener("click", openModal);
document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-cancel").addEventListener("click", closeModal);

const createListBtn = document.getElementById("create-list");
if (createListBtn)
  createListBtn.addEventListener("click", () => {
    const l = createList();
    if (l) {
      renderColumns();
      updateViews();
    }
  });

modalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("pointer-events-none"))
    closeModal();
});

// Expose an init function
export function initUI() {
  renderColumns();
  renderBoard();

  const calendar = initCalendar(todos, getP, updateViews, (view) => {
    // noop - calendar module exposes methods to switch view
  });

  renderCalendarFn = calendar.renderCalendar;
  // Return helper if caller wants to switch view
  return {
    renderCalendar: renderCalendarFn,
    switchView: calendar.switchView,
  };
}
