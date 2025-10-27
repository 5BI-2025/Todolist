import { getLists } from "./state.js";

const priorityStyles = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

function createCardHTML(card) {
  const priorityClass = priorityStyles[card.priority] || priorityStyles.medium;

  return `
    <div class="bg-white rounded-md shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer" data-card-id="${
      card.id
    }">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-sm font-semibold text-gray-800">${card.title}</h3>
        <span class="badge badge-xs ${priorityClass} border-0">${
    card.priority
  }</span>
      </div>
      <p class="text-xs text-gray-500 mb-3">${card.description || ""}</p>
      <div class="flex justify-end gap-1">
        <button class="btn btn-xs bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100" data-action="move">
          Move
        </button>
        <button class="btn btn-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" data-action="delete">
          Delete
        </button>
      </div>
    </div>
  `;
}

function createListHTML(list) {
  const cardsHTML = list.cards.map((card) => createCardHTML(card)).join(""); // Genera l'HTML per tutte le card nella lista

  return `
    <div class="shrink-0 w-72" data-list-id="${list.id}">
      <div class="bg-gray-200 rounded-lg p-3">
        
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-gray-800 text-sm px-2">${list.name}</h2>
          <div class="dropdown dropdown-end">
            <button class="btn btn-ghost btn-xs btn-square text-gray-600">⋮</button>
            <ul class="dropdown-content menu bg-white rounded-md z-10 w-40 p-2 shadow-lg border border-gray-200">
              <li><button class="text-sm w-full text-left" data-action="delete-list">Delete List</button></li>
            </ul>
          </div>
        </div>

        <div class="space-y-2 mb-2" data-cards-container>
          ${cardsHTML}
        </div>

        <button class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-300 rounded-md transition-colors" data-action="add-card">
          + Add a card
        </button>
        
      </div>
    </div>
  `;
}

export function renderBoard() {
  const container = document.getElementById("board-container");
  const lists = getLists();

  container.innerHTML = lists.map((list) => createListHTML(list)).join("");
}

export function updateListSelect() {
  const select = document.getElementById("todo-list-select"); // Ottiene il riferimento alla select
  const lists = getLists();

  select.innerHTML = lists
    .map((list) => `<option value="${list.id}">${list.name}</option>`) // Crea le opzioni della select
    .join("");
}
