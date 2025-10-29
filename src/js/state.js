import { renderBoard } from "./render.js";

let lists = [];
let nextListId = 1;
let nextCardId = 1;

export function loadState() {
  const saved = localStorage.getItem("todoData");
  if (saved) {
    const data = JSON.parse(saved);
    lists = data.lists;
    nextListId = data.nextListId;
    nextCardId = data.nextCardId;
  }
}

function saveState() {
  localStorage.setItem(
    "todoData",
    JSON.stringify({
      lists,
      nextListId,
      nextCardId,
    })
  );
}

export function getLists() {
  return lists;
}

export function addList(name) {
  const newList = {
    id: nextListId++,
    name,
    cards: [],
  };
  lists.push(newList);
  saveState();
  renderBoard();
  return newList; // non essenziale, ma puo' essere utile
}

export function deleteList(listId) {
  lists = lists.filter((list) => list.id !== listId); // Filtra l'array per rimuovere la lista con l'ID specificato
  saveState();
  renderBoard();
}

export function addCard(listId, cardData) {
  const list = lists.find((l) => l.id === listId);
  if (list) {
    const newCard = {
      id: nextCardId++,
      ...cardData, //spreader per copiare tutte le proprieta' da cardData a newCard
    };
    list.cards.push(newCard);
    saveState();
    renderBoard();
    return newCard;
  }
}

export function deleteCard(cardId) {
  lists.forEach((list) => {
    list.cards = list.cards.filter((card) => card.id !== cardId); // Rimuove la card con l'ID specificato con filtraggio
  });
  saveState();
  renderBoard();
}

export function moveCard(cardId, newListId) {
  let card = null;

  lists.forEach((list) => {
    const index = list.cards.findIndex((c) => c.id === cardId); // Cerca ogni todo(c) e controlla se ce un match di id
    if (index !== -1) {
      card = list.cards.splice(index, 1)[0]; // Rimuove la card dalla lista corrente
    }
  }); // trova e rimuove la card dalla lista corrente

  if (card) {
    const newList = lists.find((l) => l.id === newListId); // trova la nuova lista
    if (newList) {
      newList.cards.push(card);
      saveState();
      renderBoard();
    }
  }
}
