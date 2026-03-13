# DEV-10: Debugging Session Notes

## Bug 1 — Event Listener Type (Obvious)

**Line changed:** `script.js:138`

```js
// Buggy
searchInput.addEventListener('change', applyFilters);

// Fixed
searchInput.addEventListener('input', applyFilters);
```

**Symptom:** Typing in the search box did nothing. Results only updated after clicking away or pressing Enter.

**Root cause:** The `change` event only fires when an input loses focus (blur) or the user presses Enter. The `input` event fires on every keystroke, paste, or deletion.

**Lesson — Event Listeners:**
- `input` = fires immediately on every value change (real-time).
- `change` = fires on commit (blur/Enter) — useful for dropdowns and checkboxes, but wrong for live search.
- Choosing the right event type is critical for UX. A search bar that doesn't respond as you type feels broken.

---

## Bug 2 — Case Mismatch in String Comparison (Subtle)

**Line changed:** `script.js:122`

```js
// Buggy
const term = searchTerm.toUpperCase().trim();

// Fixed
const term = searchTerm.toLowerCase().trim();
```

**Symptom:** Every search query returned zero results — the grid went empty no matter what you typed.

**Root cause:** The search term was uppercased (`"JANE"`), but employee names and departments were lowercased (`"jane smith"`). Since `"jane smith".includes("JANE")` is `false`, nothing ever matched.

**Lesson — Case Sensitivity in String Matching:**
- JavaScript string comparison is case-sensitive by default.
- When doing case-insensitive search, both sides must be normalized to the same case.
- `.toLowerCase()` on both the needle and the haystack is the standard pattern.
- This bug is subtle because the code *looks* correct at a glance — it's doing a case conversion, just the wrong one.

---

## Bug 3 — Inverted Boolean Logic in Filter (Sneaky)

**Line changed:** `script.js:128`

```js
// Buggy
const matchesDept = department || emp.department === department;

// Fixed
const matchesDept = !department || emp.department === department;
```

**Symptom:** Two failures that seem contradictory:
1. On page load with "All Departments" selected, the grid was **empty**.
2. When selecting a specific department, **all** employees showed up instead of just that department.

**Root cause:** Removing the `!` inverted the short-circuit logic:
- `"All Departments"` passes an empty string. `department` (empty string) is falsy, so it evaluates `emp.department === ""`, which is always `false` — everything filtered out.
- A real department like `"Engineering"` is truthy, so `department` short-circuits to `true` — everything passes through unfiltered.

**Lesson — Boolean Logic in Filter Functions:**
- `!value` is a common "if not set, allow everything" guard. Removing the `!` doesn't just disable the guard — it inverts the entire behavior.
- Falsy values in JS: `""`, `0`, `null`, `undefined`, `false`, `NaN`. An empty dropdown value (`""`) is falsy, which is why `!department` works as a "no filter selected" check.
- When debugging filter logic, test both states: filter active AND filter inactive. This bug only fully reveals itself when you test both paths.
