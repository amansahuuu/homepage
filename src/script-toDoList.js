console.log("Script loaded!");

const STORAGE_KEY = "todoData";
let todos = [];

// Load tasks from localStorage
function loadTodos() {
  const data = localStorage.getItem(STORAGE_KEY);
  todos = data ? JSON.parse(data) : [];
}

// Save tasks to localStorage
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Render all todos
function renderTodos() {
  const list = document.getElementById("todoList");
  list.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "flex justify-between items-center bg-gray-100 px-4 py-2 rounded";

    // Task text
    const span = document.createElement("span");
    span.textContent = todo.text;
    span.className = "flex-grow cursor-pointer";

    // ✅ Style if done
    if (todo.done) {
      span.classList.add("line-through", "text-gray-500");
    }

    // 🖱️ Toggle done on click
    span.onclick = () => toggleTodo(todo.id);

    // ❌ Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.className = "text-red-500 hover:text-red-700";
    delBtn.onclick = () => deleteTodo(todo.id);

    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}


// Add new todo
function addTodo(text) {
  if (text.trim() === "") return;

  const newTodo = {
    id: Date.now(),
    text: text,
    done: false,
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
}

// Delete todo
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// Handle "Add" button click
document.getElementById("addBtn").onclick = () => {
  const input = document.getElementById("todoInput");
  addTodo(input.value);
  input.value = "";
};

// Initial load
loadTodos();
renderTodos();

function toggleTodo(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, done: !todo.done };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
}


//for widget//
/*const STORAGE_KEY = "todoData";

function loadTodos() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function toggleTodo(id) {
  let todos = loadTodos();
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, done: !todo.done };
    }
    return todo;
  });
  saveTodos(todos);
  renderTodos();
}

function renderTodos() {
  const todos = loadTodos();
  const list = document.getElementById("widgetList");
  list.innerHTML = "";

  const topTodos = todos.filter(todo => !todo.done).slice(0, 3);

  topTodos.forEach(todo => {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between bg-gray-100 px-3 py-1.5 rounded";

    const span = document.createElement("span");
    span.textContent = todo.text;
    span.className = "cursor-pointer flex-grow";
    span.onclick = () => toggleTodo(todo.id);

    li.appendChild(span);
    list.appendChild(li);
  });

  if (topTodos.length === 0) {
    list.innerHTML = `<li class="text-gray-400 italic">No pending tasks 🎉</li>`;
  }
}

renderTodos();
*/
