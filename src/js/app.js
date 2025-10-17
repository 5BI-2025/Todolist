import "../css/style.css";

const loadFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("todoList")) || [];
};

const saveToLocalStorage = () => {
  const jsonSerialized = JSON.stringify(todolistData);
  localStorage.setItem("todoList", jsonSerialized);
};

const todolistData = loadFromLocalStorage();
const ulListaTodo = document.getElementById("listatodo");
const ulListaDone = document.getElementById("listadone");
const btnAdd = document.getElementById("add");
const nuovoTodoText = document.getElementById("contenuto");

// const createTodo = (content) => {
//     return{
//         content: content,
//         svolto: false
//     }
// }

const createTodo = (title, content = "", endDate = null) => ({
  //FINISH CLASS
  id: crypto.randomUUID(),
  title,
  content,
  endDate,
  svolto: false,
});

const ToggleSvolto = (todoId) => {
  console.log(todoId);
  for (let i = 0; i < todolistData.length; i++) {
    if (todolistData[i].id === todoId) {
      todolistData[i].svolto = !todolistData[i].svolto;
      saveToLocalStorage();
      ShowTodoList();
      return;
    }
  }
};

const ShowTodoList = () => {
  ulListaTodo.innerText = "";
  ulListaDone.innerText = "";
  for (const todo of todolistData) {
    const li = document.createElement("li");
    li.innerText = `${todo.content} --- ${todo.id}`;
    li.onclick = () => ToggleSvolto(todo.id);
    if (todo.svolto) {
      ulListaDone.appendChild(li);
    } else {
      ulListaTodo.appendChild(li);
    }
  }
};

//demo
// const demo = createTodo("test");
// todolistData.push(demo);
saveToLocalStorage();
ShowTodoList();

btnAdd.onclick = (e) => {
  e.preventDefault();
  const nuovoTodo = nuovoTodoText.value;
  if (nuovoTodo.trim()) {
    const t = createTodo(nuovoTodo);
    todolistData.push(t);
    nuovoTodoText.value = "";
    saveToLocalStorage();
    ShowTodoList();
  }
};
