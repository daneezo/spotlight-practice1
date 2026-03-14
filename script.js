// We store fetched employee data here so filter functions can access it.
// This replaces the old hardcoded array — data now comes from the API.
let employees = [];

// FIX #1 (XSS): Escape user-facing strings before injecting into innerHTML.
// Without this, any HTML or <script> tags in API data (e.g. a name like
// '<img onerror="alert(1)">') would execute as real markup in the browser,
// allowing attackers to steal cookies or hijack sessions.
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const employeeGrid = document.getElementById('employee-grid');
const searchInput = document.getElementById('search-input');
const departmentFilter = document.getElementById('department-filter');
const noResults = document.getElementById('no-results');

// FIX #3 (Hardcoded URL): Extract the API base URL into a constant so it can
// be changed in one place. The hardcoded 'http://localhost:3000' would break
// in any deployed environment. This makes it easy to swap per environment.
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : '';

// Fetch employee data from the Rails API.
//
// We use the Fetch API to make a GET request to our Rails backend.
// fetch() returns a Promise, so we chain .then() calls to handle the response.
//
// CORS (Cross-Origin Resource Sharing) is required here because the frontend
// (served on one port, e.g., file:// or localhost:5500) is making a request to
// the Rails API on a different origin (localhost:3000). Browsers block these
// cross-origin requests by default for security. The Rails backend must include
// the appropriate Access-Control-Allow-Origin header in its response to permit
// the frontend to read the data. Without CORS configured on the server, the
// browser will reject the response even though the server sent it successfully.

// FIX #2 (Loading state): Show a loading message so users know data is being
// fetched. Without this, the page is blank during the network request, which
// looks broken on slow connections.
employeeGrid.innerHTML = '<p class="loading-message">Loading employees...</p>';

fetch(`${API_BASE}/api/employees`)
  .then(response => {
    // response.ok is true for HTTP status codes 200–299.
    // If the server returns an error status (4xx, 5xx), fetch does NOT reject
    // the promise — we have to check manually and throw to trigger .catch().
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    // Parse the JSON body from the response. This also returns a Promise.
    return response.json();
  })
  .then(data => {
    employees = data;

    // Populate department dropdown from employee data
    const departments = [...new Set(employees.map(emp => emp.department))].sort();
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = dept;
      departmentFilter.appendChild(option);
    });

    // Initial render once data is loaded
    renderEmployees(employees);
  })
  .catch(error => {
    // Network failures (server down, DNS error) and the manual throw above
    // both land here. We log the error and show a message to the user.
    console.error('Failed to fetch employees:', error);
    employeeGrid.innerHTML =
      '<p class="error-message">Unable to load employee data. Please try again later.</p>';
  });

function renderEmployees(employeeList) {
  if (employeeList.length === 0) {
    employeeGrid.innerHTML = '';
    noResults.hidden = false;
    return;
  }

  noResults.hidden = true;
  // FIX #5 (Null guards): Default missing fields to empty strings so a null
  // or undefined value doesn't render as the literal text "null" on the card,
  // and doesn't throw a TypeError when we call escapeHTML on it.
  employeeGrid.innerHTML = employeeList.map(emp => `
    <div class="employee-card">
      <img src="${escapeHTML(emp.photo ?? '')}" alt="${escapeHTML(emp.name ?? '')}" class="employee-photo">
      <h2 class="employee-name">${escapeHTML(emp.name ?? '')}</h2>
      <p class="employee-title">${escapeHTML(emp.title ?? '')}</p>
      <span class="employee-department">${escapeHTML(emp.department ?? '')}</span>
      <div class="employee-contact">
        <p>${escapeHTML(emp.email ?? '')}</p>
        <p>${escapeHTML(emp.phone ?? '')}</p>
        <p>${escapeHTML(emp.location ?? '')}</p>
      </div>
    </div>
  `).join('');
}

function filterEmployees(searchTerm, department) {
  const term = searchTerm.toLowerCase().trim();

  // FIX #5 (Null guards): Use nullish coalescing so a missing name or
  // department doesn't throw a TypeError on .toLowerCase(). APIs evolve —
  // treating external data as potentially incomplete prevents one bad record
  // from crashing the entire page.
  return employees.filter(emp => {
    const matchesSearch = !term ||
      (emp.name ?? '').toLowerCase().includes(term) ||
      (emp.department ?? '').toLowerCase().includes(term);
    const matchesDept = !department || emp.department === department;
    return matchesSearch && matchesDept;
  });
}

function applyFilters() {
  const filtered = filterEmployees(searchInput.value, departmentFilter.value);
  renderEmployees(filtered);
}

// FIX #4 (Debounce): Wait until the user pauses typing before filtering.
// Without this, every keystroke rebuilds the entire DOM via innerHTML, which
// causes visible lag with large datasets. 250ms is short enough to feel instant
// but long enough to avoid unnecessary work mid-word.
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

searchInput.addEventListener('input', debounce(applyFilters, 250));
departmentFilter.addEventListener('change', applyFilters);
