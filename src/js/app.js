// =========================
// Constants & State
// =========================
let LISTS = JSON.parse(localStorage.getItem("lists")) || [];
let STATES = LISTS.map((l) => l.id);

const PRIORITIES = {
  low: {
    name: "Bassa",
    color: "priority-low",
    icon: "fa-circle-check",
    textClass: "text-green-600",
    bg: "bg-green-50",
    border: "border-l-green-500",
  },
  medium: {
    name: "Media",
    color: "priority-medium",
    icon: "fa-circle-half-stroke",
    textClass: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-l-yellow-500",
  },
  high: {
    name: "Alta",
    color: "priority-high",
    icon: "fa-circle-exclamation",
    textClass: "text-red-600",
    bg: "bg-red-50",
    border: "border-l-red-500",
  },
  critical: {
    name: "Critica",
    color: "priority-critical",
    icon: "fa-triangle-exclamation",
    textClass: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-l-purple-600",
  },
};

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// Import calendar module
import { initCalendar } from "./calendar.js";

// =========================
// DOM refs
// =========================
const form = document.getElementById("new-issue-form");
const searchInput = document.getElementById("search");
const filterPriority = document.getElementById("filter-priority");
let columns = {};
const board = document.getElementById("board");
const modal = document.getElementById("modal-new-issue"),
  modalContent = document.getElementById("modal-content"),
  modalOverlay = document.getElementById("modal-overlay");

// Calendar variables that will be initialized later
let renderCalendar, switchView;

// =========================
// Helpers
// =========================
function el(tag, { cls, html, text, attrs = {}, ds = {}, children = [] } = {}) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html) n.innerHTML = html;
  if (text) n.textContent = text;
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  Object.entries(ds).forEach(([k, v]) => (n.dataset[k] = v));
  children.forEach((c) => n.appendChild(c));
  return n;
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}
const getP = (p) => PRIORITIES[p] || PRIORITIES.medium;

function saveLists() {
  localStorage.setItem("lists", JSON.stringify(LISTS));
}

function createList() {
  const title = prompt("Nome nuova lista:", "Nuova Lista");
  if (!title) return;
  const id = `list-${Date.now()}`;
  const list = { id, title: title.trim() };
  LISTS.push(list);
  saveLists();
  renderColumns();
  updateViews();
}

function renderColumns() {
  board.innerHTML = "";
  columns = {};
  LISTS.forEach((list, idx) => {
    const colWrap = el("div", {
      cls: "bg-white rounded-xl shadow-md p-5 flex flex-col min-w-[300px] board-column border-t-4 hover:shadow-lg transition-shadow duration-200",
      attrs: {},
      ds: { state: list.id },
    });
    colWrap.classList.add("border-gray-400");

    const header = el("div", { cls: "flex justify-between items-center mb-5" });
    const h3 = el("h3", {
      cls: "font-bold text-lg text-gray-700 flex items-center",
      html: `<i class=\"fas fa-list mr-2 text-gray-500\"></i> <span class=\"list-title\">${list.title}</span>`,
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
    });

    header.appendChild(h3);
    header.appendChild(
      el("span", {
        cls: "bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold",
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
        "bg-blue-50",
        "border-2",
        "border-dashed",
        "border-blue-300"
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

function reorderLists(fromId, toId) {
  const fromIdx = LISTS.findIndex((l) => l.id === fromId);
  const toIdx = LISTS.findIndex((l) => l.id === toId);
  if (fromIdx === -1 || toIdx === -1) return;
  const [item] = LISTS.splice(fromIdx, 1);
  LISTS.splice(toIdx, 0, item);
  saveLists();
  renderColumns();
  renderBoard();
}

// =========================
// UI builders
// =========================
function makeMoveBtn(dir, newState, id) {
  const cls =
    "bg-indigo-500 text-white p-1.5 rounded hover:bg-indigo-600 transition-colors text-xs";
  const html =
    dir === "left"
      ? '<i class="fas fa-arrow-left"></i>'
      : '<i class="fas fa-arrow-right"></i>';
  const btn = el("button", {
    cls,
    html,
    attrs: { title: `Sposta a ${newState}` },
  });
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    moveTodo(id, newState);
  });
  return btn;
}

function createTodoCard(todo) {
  const p = getP(todo.priority);
  const card = el("div", {
    cls: `todo-card issue-card bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 border-l-4 ${p.border}`,
    ds: { id: todo.id },
  });

  // If task has a due date that is today or past due, add visual indicator
  if (todo.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      // Past due
      card.classList.add("border-t-red-500");
    } else if (dueDate.getTime() === today.getTime()) {
      // Due today
      card.classList.add("border-t-orange-400");
    }
  }
  card.draggable = true;

  card.appendChild(
    el("h4", {
      cls: "font-semibold text-lg mb-2 text-gray-800",
      text: todo.title,
    })
  );
  if (todo.description)
    card.appendChild(
      el("p", {
        cls: "text-sm text-gray-600 mb-3 whitespace-pre-line",
        text: todo.description,
      })
    );

  card.appendChild(
    el("div", {
      cls: "text-xs font-medium mb-3 flex items-center",
      html: `<span class="inline-flex items-center rounded-full ${p.bg} ${p.textClass} px-2 py-1"><i class="fas ${p.icon} mr-1"></i> ${p.name}</span>`,
    })
  );

  const created = new Date(parseInt(todo.id));
  card.appendChild(
    el("div", {
      cls: "text-xs text-gray-500 mb-3 flex items-center",
      html: `<i class="far fa-calendar-alt mr-1"></i> ${created.toLocaleDateString(
        "it-IT"
      )}`,
    })
  );

  if (todo.dueDate) {
    const dueDate = new Date(todo.dueDate);
    card.appendChild(
      el("div", {
        cls: "text-xs text-blue-600 mb-3 flex items-center",
        html: `<i class="fas fa-hourglass-half mr-1"></i> Scadenza: ${dueDate.toLocaleDateString(
          "it-IT"
        )}`,
      })
    );
  }

  const btnGroup = el("div", { cls: "flex gap-1" });
  const idx = STATES.indexOf(todo.state);
  if (idx > 0)
    btnGroup.appendChild(makeMoveBtn("left", STATES[idx - 1], todo.id));
  if (idx < STATES.length - 1)
    btnGroup.appendChild(makeMoveBtn("right", STATES[idx + 1], todo.id));

  const deleteBtn = el("button", {
    cls: "btn-delete text-red-500 hover:bg-red-50 p-1.5 rounded hover:text-red-700 transition-colors",
    html: '<i class="fas fa-trash"></i>',
    attrs: { title: "Elimina todo" },
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm("Sei sicuro di voler eliminare questo todo?"))
      deleteTodo(todo.id);
  });

  const controls = el("div", {
    cls: "flex justify-between items-center mt-3 pt-2 border-t border-gray-100",
    children: [btnGroup, deleteBtn],
  });

  card.appendChild(controls);

  card.addEventListener("dragstart", handleDragStart);
  card.addEventListener("dragend", handleDragEnd);

  return card;
}

// =========================
// Rendering & counters
// =========================
function renderBoard() {
  STATES = LISTS.map((l) => l.id);
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
      if (columns[i.state]) columns[i.state].appendChild(createTodoCard(i));
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

// =========================
// CRUD
// =========================
function moveTodo(id, state) {
  const it = todos.find((i) => i.id === id);
  if (!it) return;
  it.state = state;
  saveTodos();
  updateViews();
}

function deleteTodo(id) {
  todos = todos.filter((i) => i.id !== id);
  saveTodos();
  updateViews();
}

// =========================
// Drag & drop
// =========================
let dragged = null;
function handleDragStart(e) {
  dragged = this;
  this.classList.add(
    "opacity-50",
    "rotate-1",
    "shadow-md",
    "scale-105",
    "z-10"
  );
  e.dataTransfer.effectAllowed = "move";
  try {
    e.dataTransfer.setData("text/todo", this.dataset.id);
  } catch (err) {
    e.dataTransfer.setData("text/plain", this.dataset.id);
  }
}

function handleDragEnd() {
  this.classList.remove(
    "opacity-50",
    "rotate-1",
    "shadow-md",
    "scale-105",
    "z-10"
  );
  document
    .querySelectorAll(".board-column")
    .forEach((c) =>
      c.classList.remove(
        "bg-blue-50",
        "border-2",
        "border-dashed",
        "border-blue-300"
      )
    );
}

// =========================
// Column events
// =========================
document.querySelectorAll(".board-column").forEach((col) => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault();
    col.classList.add(
      "bg-blue-50",
      "border-2",
      "border-dashed",
      "border-blue-300"
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
    moveTodo(id, ns);
  });
});

// =========================
// Form, search & filter
// =========================
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
  todos.push(newTodo);
  saveTodos();
  updateViews();
  form.reset();
  form.title.focus();
  closeModal();
});

// Update both views when filters change
function updateViews() {
  renderBoard();
  // Update calendar view if it exists and is visible
  if (
    renderCalendar &&
    document.getElementById("calendar-view") &&
    !document.getElementById("calendar-view").classList.contains("hidden")
  ) {
    renderCalendar();
  }
}

searchInput.addEventListener("input", updateViews);
filterPriority.addEventListener("change", updateViews);

// =========================
// Modal
// =========================
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
if (createListBtn) createListBtn.addEventListener("click", createList);

renderColumns();
renderBoard();
modalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("pointer-events-none"))
    closeModal();
});

// =========================
// Init
// =========================
renderBoard();

// Initialize calendar right away as modules are already executed when DOM is ready
const calendar = initCalendar(todos, getP, updateViews, (view) => {
  // This callback isn't needed anymore as we get the function directly
});

// Assign the returned functions to our global variables
renderCalendar = calendar.renderCalendar;
switchView = calendar.switchView;
