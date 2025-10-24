import { el } from "./dom.js";
import { handleDragStart, handleDragEnd } from "./drag.js";
import { getP, todos, STATES } from "./state.js";

export function makeMoveBtn(dir, newState, id, moveTodo) {
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

export function createTodoCard(todo, moveTodo, deleteTodo) {
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

  if (todo.dueDate) {
    const dueDateObj = new Date(todo.dueDate);
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueOnly = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
    const overdue = dueOnly < todayOnly;
    const dueClass = overdue ? "text-sm text-red-500 font-semibold mb-3 flex items-center" : "text-sm text-gray-500 mb-3 flex items-center";
    card.appendChild(
      el("div", {
        cls: dueClass,
        html: `<i class="fas fa-hourglass-end mr-1"></i> Scadenza: ${dueDateObj.toLocaleDateString("it-IT")}`,
      })
    );
  }

  const btnGroup = el("div", { cls: "flex gap-1" });
  const idx = STATES.indexOf(todo.state);
  if (idx > 0)
    btnGroup.appendChild(
      makeMoveBtn("left", STATES[idx - 1], todo.id, moveTodo)
    );
  if (idx < STATES.length - 1)
    btnGroup.appendChild(
      makeMoveBtn("right", STATES[idx + 1], todo.id, moveTodo)
    );

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
