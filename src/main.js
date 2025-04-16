import './style.css';
import { TodoList } from './modules/todo.js';
import { storage } from './modules/storage.js';
import { setupClock } from './modules/time.js';
import { getWeather } from './modules/weather.js';
import { Auth } from './modules/auth.js';
import { CurrencyConverter } from './modules/currency.js';

// Initialize Auth
const auth = new Auth();

// Initialize TodoList
const todoList = new TodoList();

// Initialize CurrencyConverter
const currencyConverter = new CurrencyConverter();

// Theme handling
function initializeTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// DOM Elements
const authContainer = document.getElementById('auth-container');
const app = document.getElementById('app');
const signInForm = document.getElementById('sign-in-form');
const signUpForm = document.getElementById('sign-up-form');
const showSignupBtn = document.getElementById('show-signup');
const showSigninBtn = document.getElementById('show-signin');
const signOutBtn = document.getElementById('sign-out');
const themeToggleBtn = document.getElementById('theme-toggle');

// Currency converter elements
const currencyAmount = document.getElementById('currency-amount');
const currencyFrom = document.getElementById('currency-from');
const currencyTo = document.getElementById('currency-to');
const currencyResult = document.getElementById('currency-result');

// Theme toggle handler
themeToggleBtn.addEventListener('click', toggleTheme);

// Initialize currency converter
async function setupCurrencyConverter() {
  await currencyConverter.init();

  // Populate currency selects
  const currencies = currencyConverter.getAvailableCurrencies();
  currencies.forEach(currency => {
    if (currency !== 'USD') {
      const option = new Option(currency, currency);
      currencyFrom.add(option.cloneNode(true));
    }
    if (currency !== 'UAH') {
      const option = new Option(currency, currency);
      currencyTo.add(option.cloneNode(true));
    }
  });

  // Update result when inputs change
  function updateResult() {
    const amount = parseFloat(currencyAmount.value);
    const from = currencyFrom.value;
    const to = currencyTo.value;

    if (!isNaN(amount)) {
      const result = currencyConverter.convert(amount, from, to);
      currencyResult.textContent = result
        ? `${amount} ${from} = ${result.toFixed(2)} ${to}`
        : 'Unable to convert';
    }
  }

  currencyAmount.addEventListener('input', updateResult);
  currencyFrom.addEventListener('change', updateResult);
  currencyTo.addEventListener('change', updateResult);

  // Initial conversion
  updateResult();
}

// Show appropriate form based on whether there are any users
function showInitialForm() {
  if (auth.hasUsers()) {
    signInForm.classList.remove('hidden');
    signUpForm.classList.add('hidden');
  } else {
    signInForm.classList.add('hidden');
    signUpForm.classList.remove('hidden');
  }
}

// Toggle between sign in and sign up forms
showSignupBtn.addEventListener('click', () => {
  signInForm.classList.add('hidden');
  signUpForm.classList.remove('hidden');
});

showSigninBtn.addEventListener('click', () => {
  signUpForm.classList.add('hidden');
  signInForm.classList.remove('hidden');
});

// Handle sign in
document.getElementById('signin-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;

  try {
    auth.signIn(email, password);
    showApp();
  } catch (error) {
    alert(error.message);
  }
});

// Handle sign up
document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    auth.signUp(email, password);
    showApp();
  } catch (error) {
    alert(error.message);
  }
});

// Handle sign out
signOutBtn.addEventListener('click', () => {
  auth.signOut();
  hideApp();
});

function showApp() {
  authContainer.classList.add('hidden');
  app.classList.remove('hidden');

  // Load todos for current user
  todoList.items = storage.load(auth.currentUser.email);

  // Initialize app features
  setupClock(document.getElementById('clock'));
  updateWeather();
  setupCurrencyConverter();
  renderTodos();
}

function hideApp() {
  app.classList.add('hidden');
  authContainer.classList.remove('hidden');
  showInitialForm();
}

// Setup weather
async function updateWeather() {
  const weatherData = await getWeather();
  const weatherElement = document.getElementById('weather');

  if (weatherData) {
    weatherElement.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img src="${weatherData.icon}" alt="${weatherData.description}" class="w-16 h-16" />
          <div class="ml-4">
            <div class="text-2xl font-bold">${weatherData.temp}°C</div>
            <div class="text-sm text-gray-600">${weatherData.city}, ${weatherData.country}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm">Feels like: ${weatherData.feels_like}°C</div>
          <div class="text-sm">Humidity: ${weatherData.humidity}%</div>
          <div class="text-sm">Wind: ${weatherData.wind} m/s</div>
        </div>
      </div>
      <div class="mt-2 text-sm text-gray-600 capitalize">${weatherData.description}</div>
    `;
  }
}

// Setup tabs
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  function setActiveTab(tabId) {
    // Update button states
    tabButtons.forEach(button => {
      if (button.dataset.tab === tabId) {
        button.classList.add('active', 'bg-indigo-100');
        button.classList.remove('hover:bg-indigo-50');
      } else {
        button.classList.remove('active', 'bg-indigo-100');
        button.classList.add('hover:bg-indigo-50');
      }
    });

    // Update content visibility
    tabContents.forEach(content => {
      if (content.id === `${tabId}-list`) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    });

    // Render todos for the active tab
    renderTodos(tabId);
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      setActiveTab(button.dataset.tab);
    });
  });
}

// Create todo item element
function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow-md priority-${todo.priority} hover:shadow-lg transition-all`;
  if (todo.done) li.classList.add('todo-done');

  const leftSection = document.createElement('div');
  leftSection.className = 'flex flex-col flex-grow';

  const textSpan = document.createElement('span');
  textSpan.textContent = todo.text;
  textSpan.className = 'text-theme-primary font-medium';

  const timestamp = document.createElement('span');
  timestamp.className = 'timestamp';
  timestamp.textContent = new Date(todo.createdAt).toLocaleString();

  leftSection.append(textSpan, timestamp);

  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'flex gap-2';

  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = todo.done ? '↩️' : '✓';
  toggleBtn.className = `w-8 h-8 flex items-center justify-center rounded-lg ${todo.done ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`;
  toggleBtn.onclick = () => {
    todo.toggleDone();
    renderTodos();
    storage.save(todoList.items, auth.currentUser.email);
  };

  const archiveBtn = document.createElement('button');
  archiveBtn.innerHTML = '📥';
  archiveBtn.className = 'w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200';
  archiveBtn.onclick = () => {
    todo.toggleArchived();
    renderTodos();
    storage.save(todoList.items, auth.currentUser.email);
  };

  const editBtn = document.createElement('button');
  editBtn.innerHTML = '✎';
  editBtn.className = 'w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200';
  editBtn.onclick = () => {
    const newText = prompt('Edit task:', todo.text);
    if (newText) {
      todo.updateText(newText.trim());
      renderTodos();
      storage.save(todoList.items, auth.currentUser.email);
    }
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = '×';
  deleteBtn.className = 'w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-bold text-xl';
  deleteBtn.onclick = () => {
    todoList.removeItem(todo.id);
    renderTodos();
    storage.save(todoList.items, auth.currentUser.email);
  };

  buttonsDiv.append(toggleBtn, archiveBtn, editBtn, deleteBtn);
  li.append(leftSection, buttonsDiv);
  return li;
}

// Render todos
function renderTodos(filter = 'all') {
  const lists = {
    all: document.querySelector('#all-list ul'),
    done: document.querySelector('#done-list ul'),
    archived: document.querySelector('#archived-list ul')
  };

  // Clear all lists
  Object.values(lists).forEach(list => list.innerHTML = '');

  // Render todos for the active tab
  const items = todoList.getSortedItems(filter);
  const list = lists[filter];
  if (list) {
    items.forEach(todo => list.appendChild(createTodoElement(todo)));
  }
}

// Form submission
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const prioritySelect = document.getElementById('priority-select');

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  const priority = prioritySelect.value;

  if (text) {
    todoList.addItem(text, priority);
    storage.save(todoList.items, auth.currentUser.email);
    renderTodos();
    todoInput.value = '';
  }
});

// Initialize tabs
setupTabs();

// Initialize theme and app
initializeTheme();

// Check if user is already authenticated
if (auth.isAuthenticated()) {
  showApp();
} else {
  showInitialForm();
}