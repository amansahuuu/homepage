const STORAGE_KEY = "todoData";

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
      return { ...todo, done: true };
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

  if (topTodos.length === 0) {
    list.innerHTML = `<li class="text-gray-400 italic pl-2">No pending tasks 🎉</li>`;
    return;
  }

  topTodos.forEach(todo => {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between px-3 py-1 rounded transition";

    const text = document.createElement("span");
    text.textContent = todo.text;
    text.className = "text-sm font-mono text-black pl-4"; // ⬅ padding-left for text

    const btn = document.createElement("button");
    btn.textContent = "...✅";
    btn.title = "Mark as done";
    btn.className =
      "ml-4 text-black px-2 py-0.5 text-sm rounded hover:bg-black hover:text-white cursor-not-allowed transition"; // ⬅ margin-left to separate from text
    btn.onclick = () => toggleTodo(todo.id);

    li.appendChild(text);
    li.appendChild(btn);
    list.appendChild(li);
  });
}


renderTodos();
