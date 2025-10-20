// =========================
// Constants & State
// =========================
const STATES = ["backlog", "inprogress", "review", "done"];

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

// try new key first, fall back to old key to preserve existing data
let todos =
  JSON.parse(
    localStorage.getItem("todos-kanban") ||
      localStorage.getItem("issues-kanban")
  ) || [];

// =========================
// DOM refs
// =========================
const $ = (id) => document.getElementById(id);
const form = $("new-issue-form");
const searchInput = $("search");
const filterPriority = $("filter-priority");
const columns = {
  backlog: $("backlog"),
  inprogress: $("inprogress"),
  review: $("review"),
  done: $("done"),
};
const modal = $("modal-new-issue"),
  modalContent = $("modal-content"),
  modalOverlay = $("modal-overlay");

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
  localStorage.setItem("todos-kanban", JSON.stringify(todos));
}
const getP = (p) => PRIORITIES[p] || PRIORITIES.medium;

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
    moveIssue(id, newState);
  });
  return btn;
}

function createTodoCard(todo) {
  const p = getP(todo.priority);
  const card = el("div", {
    cls: `todo-card issue-card bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 border-l-4 ${p.border}`,
    ds: { id: todo.id },
  });
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

  const btnGroup = el("div", { cls: "flex gap-1" });
  const idx = STATES.indexOf(todo.state);
  if (idx > 0)
    btnGroup.appendChild(makeMoveBtn("left", STATES[idx - 1], todo.id));
  if (idx < STATES.length - 1)
    btnGroup.appendChild(makeMoveBtn("right", STATES[idx + 1], todo.id));

  const controls = el("div", {
    cls: "flex justify-between items-center mt-3 pt-2 border-t border-gray-100",
    children: [
      btnGroup,
      el("button", {
        cls: "text-red-500 hover:bg-red-50 p-1.5 rounded hover:text-red-700 transition-colors",
        html: '<i class="fas fa-trash"></i>',
        attrs: { title: "Elimina todo" },
      }),
    ],
  });

  controls.querySelector("button:last-child").addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm("Sei sicuro di voler eliminare questo todo?"))
      deleteTodo(todo.id);
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
  STATES.forEach((s) => (columns[s].innerHTML = ""));
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
    .forEach((i) => columns[i.state].appendChild(createTodoCard(i)));

  updateCounters();
}

function updateCounters() {
  STATES.forEach((s) => {
    const c = todos.filter((i) => i.state === s).length;
    const elc = $(`${s}-count`);
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
  renderBoard();
}

function deleteTodo(id) {
  todos = todos.filter((i) => i.id !== id);
  saveTodos();
  renderBoard();
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
  e.dataTransfer.setData("text/plain", this.dataset.id);
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
    .querySelectorAll(".kanban-column")
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
document.querySelectorAll(".kanban-column").forEach((col) => {
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
    const id = e.dataTransfer.getData("text/plain");
    const ns = col.dataset.state;
    moveTodo(id, ns);
  });
});

// =========================
// Form, search & filter
// =========================
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = form.title.value.trim();
  if (!title) return alert("Il titolo è obbligatorio!");
  const newTodo = {
    id: Date.now().toString(),
    title,
    description: form.description.value.trim(),
    priority: form.priority.value || "medium",
    state: "backlog",
  };
  todos.push(newTodo);
  saveTodos();
  renderBoard();
  form.reset();
  form.title.focus();
  closeModal();
});

searchInput.addEventListener("input", renderBoard);
filterPriority.addEventListener("change", renderBoard);

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

$("toggle-new-issue").addEventListener("click", openModal);
$("modal-close").addEventListener("click", closeModal);
$("modal-cancel").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("pointer-events-none"))
    closeModal();
});

// =========================
// Init
// =========================
renderBoard();
