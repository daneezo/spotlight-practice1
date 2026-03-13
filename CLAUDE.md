# Employee Directory — Spotlight

## What this project is

A single-page employee directory app. Users can browse employee cards, search by name or department, and filter by department via a dropdown. All data is currently hardcoded in `script.js` (no backend).

## Tech stack

Plain HTML, CSS, and JavaScript — no frameworks, no build tools, no bundler. Just open `index.html` in a browser.

## File structure

```
index.html   — Page markup (single page)
styles.css   — All styles, CSS custom properties in :root, mobile-first responsive
script.js    — Employee data array, DOM logic, filtering, rendering
```

## Coding conventions

- **CSS**: Use CSS custom properties defined in `:root` for colors, shadows, and border-radius. Selector names follow BEM-lite (`employee-card`, `employee-name`). Use `var(--token)` instead of raw values.
- **JS**: Vanilla DOM APIs only (`getElementById`, `createElement`, `addEventListener`). Render HTML with template literals in `innerHTML`. Filter logic is a pure function (`filterEmployees`) separate from DOM updates (`renderEmployees`). A single `applyFilters` function wires all inputs together.
- **HTML**: Use semantic elements (`<header>`, `<main>`). Add `aria-label` attributes to interactive elements. Load the script at the bottom of `<body>`.
- **Responsive**: Mobile breakpoint at 600px. Grid and flex layouts collapse gracefully.

## Rules

- **Never hardcode dropdown/filter values in HTML.** Always auto-populate them from the data source in JS (e.g., derive department list from the `employees` array with `new Set()`).
- **Keep filters composable.** When adding a new filter, add it as a parameter to `filterEmployees` and wire it through `applyFilters` — don't create separate event handlers that filter independently.
- **Employee data shape.** Each employee object has: `id`, `name`, `department`, `title`, `email`, `phone`, `location`, `photo`.

## Branch naming

`feature/DEV-{ticket}-short-description` (e.g., `feature/DEV-8-department-filter`)

## Commit style

Conventional commits: `feat:`, `fix:`, `refactor:`, etc. Include the ticket number in parentheses (e.g., `feat: add department filter dropdown (DEV-8)`).
