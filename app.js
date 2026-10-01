/*
  TaskFlow Lab — маленькая копия TaskFlow для занятий по Git.
  Задачи можно добавить, отметить выполненными и удалить. Они сохраняются
  в localStorage, а кнопка «Загрузить примеры» берёт пять задач с jsonplaceholder.
*/

// ===== КОНСТАНТЫ =====

const STORAGE_KEY = 'taskflow-lab:tasks';
const EXAMPLES_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=5';

// ===== СОСТОЯНИЕ =====
// Одна задача: { id: 1760000000000, title: 'Купить хлеб', done: false }

const state = {
  tasks: [],
};

// ===== ЭЛЕМЕНТЫ =====

const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const list = document.querySelector('#task-list');
const examplesBtn = document.querySelector('#examples-btn');
const statusText = document.querySelector('#status');

// ===== ХРАНИЛИЩЕ =====

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn('Не удалось прочитать задачи из localStorage', error);
    return [];
  }
}

// ===== СЕТЬ =====

async function fetchExamples() {
  const response = await fetch(EXAMPLES_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const todos = await response.json();
  return todos.map((todo) => ({
    id: Date.now() + todo.id,
    title: todo.title,
    done: todo.completed,
  }));
}

// ===== ИЗМЕНЕНИЕ СОСТОЯНИЯ =====
// Каждая функция меняет state и вызывает update()

function addTask(title) {
  state.tasks = [...state.tasks, { id: Date.now(), title, done: false }];
  update();
}

function addTasks(newTasks) {
  state.tasks = [...state.tasks, ...newTasks];
  update();
}

function toggleTask(id) {
  state.tasks = state.tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task,
  );
  update();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  update();
}

// ===== РЕНДЕР =====

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = task.done ? 'task task--done' : 'task';
  li.dataset.id = task.id;

  const title = document.createElement('span');
  title.className = 'task__title';
  title.textContent = task.title;

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.dataset.action = 'toggle';
  toggleBtn.textContent = task.done ? 'Вернуть' : 'Готово';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.dataset.action = 'delete';
  deleteBtn.textContent = 'Удалить';

  li.append(title, toggleBtn, deleteBtn);
  return li;
}

function render() {
  list.innerHTML = '';
  state.tasks.forEach((task) => list.append(createTaskElement(task)));
}

// ===== ОБЩАЯ ТОЧКА =====

function update() {
  saveTasks();
  render();
}

// ===== ОБРАБОТЧИКИ =====

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  addTask(title);
  form.reset();
  titleInput.focus();
});

list.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const id = Number(button.closest('.task').dataset.id);
  if (button.dataset.action === 'toggle') toggleTask(id);
  if (button.dataset.action === 'delete') deleteTask(id);
});

examplesBtn.addEventListener('click', async () => {
  examplesBtn.disabled = true;
  statusText.textContent = 'Загружаем…';
  try {
    const examples = await fetchExamples();
    addTasks(examples);
    statusText.textContent = '';
  } catch (error) {
    console.error(error);
    statusText.textContent = 'Не удалось загрузить примеры. Попробуй ещё раз.';
  } finally {
    examplesBtn.disabled = false;
  }
});

// ===== СТАРТ =====

state.tasks = loadTasks();
render();
