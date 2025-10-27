import {
  addList,
  deleteList,
  addCard,
  deleteCard,
  moveCard,
  getLists,
} from "./state.js";
import { updateListSelect } from "./render.js";

export function initEvents() {
  // EVENT LISTENER PER IL BOARD
  document
    .getElementById("board-container")
    .addEventListener("click", handleBoardClick);

  // RESTO (PER I MODAL)
  document
    .getElementById("add-list-btn")
    .addEventListener("click", openNewListModal);
  document
    .getElementById("new-list-form")
    .addEventListener("submit", handleNewList);
  document
    .getElementById("cancel-list-btn")
    .addEventListener("click", closeNewListModal);
  document
    .getElementById("new-todo-form")
    .addEventListener("submit", handleNewTodo);
  document
    .getElementById("cancel-todo-btn")
    .addEventListener("click", closeNewTodoModal);
}

function handleBoardClick(e) {
  const action = e.target.dataset.action; //IMPORTANTE, target = elemento HTML cliccato, DATASET = attributi data-* e action e' il nome dell'attributo

  if (action === "delete") {
    const cardId = parseInt(e.target.closest("[data-card-id]").dataset.cardId); // IMPORTANTE: risale fino all'elemento con data-card-id
    deleteCard(cardId);
  }

  if (action === "move") {
    const cardId = parseInt(e.target.closest("[data-card-id]").dataset.cardId);
    handleMoveCard(cardId);
  }

  if (action === "add-card") {
    const listId = parseInt(e.target.closest("[data-list-id]").dataset.listId);
    openNewTodoModal(listId);
  }

  if (action === "delete-list") {
    const listId = parseInt(e.target.closest("[data-list-id]").dataset.listId);
    if (confirm("Delete this list and all its cards?")) {
      deleteList(listId);
    }
  }
}

function handleMoveCard(cardId) {
  const lists = getLists(); // Riceve riferimento all'array originale
  const listNames = lists
    .map((list, index) => `${index + 1}. ${list.name}`) // Crea elenco numerato con le liste
    .join("\n");
  const choice = prompt(`Move card to:\n${listNames}\n\nEnter list number:`);

  if (choice) {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < lists.length) {
      moveCard(cardId, lists[index].id);
    } else {
      alert("Invalid list number! Please enter a number from the list.");
    }
  }
}

function openNewListModal() {
  document.getElementById("new-list-modal").showModal();
  document.getElementById("list-name-input").value = ""; // Pulisce il campo input
}

function closeNewListModal() {
  document.getElementById("new-list-modal").close();
}

function openNewTodoModal(listId) {
  updateListSelect(); // Aggiorna le opzioni della select
  document.getElementById("todo-list-select").value = listId;
  document.getElementById("new-todo-modal").showModal();

  // Clear form
  document.getElementById("todo-title-input").value = "";
  document.getElementById("todo-description-input").value = "";
  document.getElementById("todo-priority-select").value = "medium";
}

function closeNewTodoModal() {
  document.getElementById("new-todo-modal").close();
}

function handleNewList(e) {
  e.preventDefault(); // Previene reload pagina
  const name = document.getElementById("list-name-input").value.trim(); //ottiene il valore dell'input
  if (name) {
    addList(name);
    updateListSelect(); // Aggiorna le opzioni della select
    closeNewListModal();
  }
}

function handleNewTodo(e) {
  e.preventDefault();

  const cardData = {
    title: document.getElementById("todo-title-input").value.trim(),
    description: document.getElementById("todo-description-input").value.trim(),
    priority: document.getElementById("todo-priority-select").value,
  };

  const listId = parseInt(document.getElementById("todo-list-select").value);

  if (cardData.title) {
    addCard(listId, cardData);
    closeNewTodoModal();
  }
}
