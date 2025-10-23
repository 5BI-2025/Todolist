export let LISTS = JSON.parse(localStorage.getItem("lists")) || [];
export let STATES = LISTS.map((l) => l.id);

export const PRIORITIES = {
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

export let todos = JSON.parse(localStorage.getItem("todos")) || [];

export function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

export const getP = (p) => PRIORITIES[p] || PRIORITIES.medium;

export function saveLists() {
  localStorage.setItem("lists", JSON.stringify(LISTS));
}

export function createList() {
  const title = prompt("Nome nuova lista:", "Nuova Lista");
  if (!title) return null;
  const id = `list-${Date.now()}`;
  const list = { id, title: title.trim() };
  LISTS.push(list);
  STATES = LISTS.map((l) => l.id);
  saveLists();
  return list;
}

export function reorderLists(fromId, toId) {
  const fromIdx = LISTS.findIndex((l) => l.id === fromId);
  const toIdx = LISTS.findIndex((l) => l.id === toId);
  if (fromIdx === -1 || toIdx === -1) return;
  const [item] = LISTS.splice(fromIdx, 1);
  LISTS.splice(toIdx, 0, item);
  STATES = LISTS.map((l) => l.id);
  saveLists();
}

export function deleteList(listId) {
  const idx = LISTS.findIndex((l) => l.id === listId);
  if (idx === -1) return;

  const todosInList = todos.filter((t) => t.state === listId);
  const availableLists = LISTS.filter((l) => l.id !== listId);

  if (availableLists.length > 0) {
    const nextList = availableLists[0].id;
    todosInList.forEach((todo) => {
      todo.state = nextList;
    });
  } else {
    todos = todos.filter((t) => t.state !== listId);
  }

  LISTS.splice(idx, 1);
  STATES = LISTS.map((l) => l.id);

  saveTodos();
  saveLists();
}

export function addTodo(newTodo) {
  todos.push(newTodo);
  saveTodos();
}

export function moveTodo(id, state) {
  const it = todos.find((i) => i.id === id);
  if (!it) return;
  it.state = state;
  saveTodos();
}

export function deleteTodo(id) {
  const idx = todos.findIndex((i) => i.id === id);
  if (idx === -1) return;
  todos.splice(idx, 1);
  saveTodos();
}
