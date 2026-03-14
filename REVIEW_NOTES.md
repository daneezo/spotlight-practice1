# Code Review: `script.js`

**Reviewer:** Senior Engineer (automated review)
**Date:** 2026-03-14
**Branch:** `DEV-16-Use-Claude-Code-to-review-and-refactor-script.js`

---

## Issue 1: XSS Vulnerability — Unsanitized API Data in `innerHTML` (Critical)

**Where:** `renderEmployees()`, lines 64–76

**What's wrong:**
Employee data from the API is interpolated directly into an `innerHTML` template literal with zero escaping:

```js
<h2 class="employee-name">${emp.name}</h2>
<p>${emp.email}</p>
```

If any field in the API response contains HTML or script tags — whether from a compromised backend, a bad database entry, or a man-in-the-middle attack — it will execute as real HTML/JS in every user's browser.

**Why it matters:**
This is a textbook Cross-Site Scripting (XSS) vulnerability. An attacker who can influence any employee record (name, title, email, etc.) can steal session cookies, redirect users, or deface the page. Even without malicious intent, a name like `O'Brien & Associates <Inc>` will break the card layout because `<Inc>` is parsed as an HTML tag.

**Fix:**
Add a small `escapeHTML()` helper and wrap every interpolated value:

```js
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Then in the template:
<h2 class="employee-name">${escapeHTML(emp.name)}</h2>
```

---

## Issue 2: No Loading State — Users See a Blank Page During Fetch (UX)

**Where:** `fetch()` call, lines 22–54

**What's wrong:**
When the page loads, `fetch()` fires and the grid is empty until data arrives. On slow connections or if the API is under load, users stare at a blank page with no indication that anything is happening.

**Why it matters:**
Users don't know if the app is broken or just loading. This is the number one reason people hit refresh repeatedly — which makes load problems worse. A junior dev might not notice this locally because `localhost` responses are instant, but real users on real networks will.

**Fix:**
Show a loading indicator before the fetch and remove it when data arrives or an error occurs:

```js
employeeGrid.innerHTML = '<p class="loading-message">Loading employees...</p>';

fetch('http://localhost:3000/api/employees')
  .then(response => { ... })
  .then(data => {
    // renderEmployees() already replaces innerHTML, so the loader disappears
  })
  .catch(error => {
    // error handler already replaces innerHTML
  });
```

---

## Issue 3: Hardcoded API URL (Maintainability)

**Where:** Line 22

**What's wrong:**
The API endpoint is hardcoded as `http://localhost:3000/api/employees`. This will break as soon as the app is deployed anywhere that isn't `localhost:3000`.

**Why it matters:**
Every environment (dev, staging, production) will have a different API origin. Hardcoding it means you need to manually edit `script.js` before each deployment — that's error-prone and easy to forget. It also makes it impossible to test against a staging API without changing source code.

**Fix:**
Extract the base URL into a constant at the top of the file, or derive it from the page's own origin:

```js
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : '';  // same-origin in production

fetch(`${API_BASE}/api/employees`)
```

---

## Issue 4: Search Fires on Every Keystroke — No Debounce (Performance)

**Where:** Line 96

**What's wrong:**
```js
searchInput.addEventListener('input', applyFilters);
```
`applyFilters` runs on every single keystroke. Each call runs `filterEmployees` (iterates the full array) and `renderEmployees` (rebuilds the entire DOM via `innerHTML`).

**Why it matters:**
With 20 employees this is fine. With 500+ employees, you're rebuilding hundreds of DOM nodes 5–10 times per second as someone types "marketing". The DOM thrash causes visible jank, especially on lower-end devices. This is the kind of issue that doesn't show up until production data scales up.

**Fix:**
Debounce the search input so it only fires after the user pauses typing:

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

searchInput.addEventListener('input', debounce(applyFilters, 250));
```

---

## Issue 5: Missing Null/Undefined Guards on Employee Fields (Robustness)

**Where:** `renderEmployees()` and `filterEmployees()`

**What's wrong:**
The code assumes every employee object has every field populated. If the API returns an employee with `phone: null` or a missing `location` field, `renderEmployees` will print "null" or "undefined" as visible text on the card, and `filterEmployees` will throw a `TypeError` on `.toLowerCase()`.

**Why it matters:**
APIs evolve. A field that's always present today might become optional tomorrow. Defensive code prevents a single bad record from crashing the entire page. As a junior dev, always treat external data as potentially incomplete — it's one of the most common sources of production bugs.

**Fix:**
Default to empty strings:

```js
<p>${escapeHTML(emp.phone ?? '')}</p>
```

And in the filter:

```js
(emp.name ?? '').toLowerCase().includes(term)
```

---

## Summary

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | XSS via innerHTML | Critical | Small |
| 2 | No loading state | Medium | Small |
| 3 | Hardcoded API URL | Medium | Small |
| 4 | No search debounce | Low (scales) | Small |
| 5 | No null guards | Low (scales) | Small |

**Recommended priority:** Fix #1 (XSS) immediately — it's a security hole. Then #2 and #3 in the same PR since they're quick wins. Issues #4 and #5 are good follow-ups as the dataset grows.
