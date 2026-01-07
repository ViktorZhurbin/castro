# TODO: Bare Static Evolution

## Phase 1: Plugin Architecture (Priority: HIGH) - DONE

## Phase 2: Component Improvements (Priority: MEDIUM)

### 2.1 Smart Component Loading - DONE

### 2.2 Component Props Support

**Goal**: Pass data from markdown to components.

**Syntax ideas:**

```html
<!-- Option A: HTML attributes -->
<counter-component initial="5"></counter-component>

<!-- Option B: JSON data attribute -->
<counter-component data='{"initial": 5, "step": 2}'></counter-component>
```

**Implementation**: Components read attributes in `connectedCallback()`.

### 2.3 Component Metadata

**Goal**: Components declare their requirements/configuration.

**Approach:**

```javascript
// counter.js
export const meta = {
	name: "counter-component",
	dependencies: ["bare-signals"],
	props: {
		initial: { type: "number", default: 0 },
		step: { type: "number", default: 1 },
	},
};

class CounterComponent extends HTMLElement {
	// ...
}
```

Plugin can read metadata for validation/optimization.

### 2.4 Better Auto-Discovery - DONE

---

## Phase 3: JSX Support (Priority: LOW - Long-term Vision)

### Goal

Allow writing components in JSX, compile to vanilla web components with islands architecture.

### Vision

```jsx
// counter.jsx
import { createSignal } from "bare-signals";

export default function Counter({ initial = 0 }) {
	const [count, setCount] = createSignal(initial);

	return (
		<div class="counter">
			<p>Count: {count()}</p>
			<button onClick={() => setCount(count() + 1)}>+</button>
		</div>
	);
}
```

Compiles to:

```javascript
class Counter extends HTMLElement {
	connectedCallback() {
		const initial = this.getAttribute("initial") || 0;
		const [count, setCount] = createSignal(initial);
		// ... render logic
	}
}
customElements.define("counter-component", Counter);
```

### Implementation Research Needed

1. **JSX transformer**: esbuild plugin, babel, or custom?
2. **Build step**: How to integrate with bare-static?
3. **HMR**: Hot module reload for development?
4. **Component composition**: How do components use other components?
5. **Reactivity**: How to wire signals to DOM efficiently?

### References to study

- Solid.js compiler (fine-grained reactivity)
- Preact with htm (no build step)
- Lit (web components + declarative templates)
- petite-vue (progressive enhancement)

---

## Phase 4: Signals Abstraction (Priority: LOW)

### Goal

Make signals swappable - users choose their reactivity system.

### Approach: No abstraction needed!

Components import directly:

```javascript
// Using bare-signals
import { createSignal } from "/vendor/bare-signals.js";

// Using Solid
import { createSignal } from "solid-js";

// Using Preact Signals
import { signal } from "@preact/signals";
```

**Plugin's job**: Copy the chosen signals library to vendor/.

**User's job**: Import the right library in components.

**Future enhancement**: Plugin option to configure which signals library to use:

```javascript
bareIslands({
	signals: "@vktrz/bare-signals", // or 'solid-js' or '@preact/signals'
});
```

Plugin could then:

1. Copy the specified library
2. Generate import maps
3. Provide helpful error messages if imports fail

---

## Quick Wins / Minor Improvements

### Documentation

- [ ] Add "Interactive Islands" section to README
- [ ] Document component conventions (file naming, props, etc.)
- [ ] Add example components beyond counter (form, chart, toggle)
- [ ] Document bare-signals integration

### Developer Experience

- [ ] Add `bare-static create-component <name>` CLI command
- [ ] Better error messages (e.g., "Component X imported but not found")
- [ ] Validate component file names (no spaces, special chars)
- [ ] Add component template/boilerplate

### Performance

- [ ] Minify component scripts in production
- [ ] Add cache busting (content hash in filenames)
- [ ] Lazy load components (Intersection Observer)
- [ ] Tree-shake unused code from signals library

### Testing

- [ ] Test suite for bare-islands plugin
- [ ] Test component mounting/unmounting
- [ ] Test error handling (missing files, syntax errors)
- [ ] Integration tests for full build pipeline

---

## Open Questions / Decisions Needed

1. **CSS**: How should component styles work? Scoped? CSS modules?

---

## Success Criteria

**For Phase 1 (Plugins):**

- [ ] Core SSG is <200 LOC (excluding plugins)
- [ ] Plugin system is <50 LOC
- [ ] No breaking changes to existing users
- [ ] Documentation is clear and complete
- [ ] Can build website package with plugin enabled

**For Phase 2 (Components):**

- [ ] Components only load on pages that use them
- [ ] Props work intuitively
- [ ] Clear conventions documented

**For Phase 3 (JSX):**

- [ ] Can write components in JSX
- [ ] Compilation happens transparently
- [ ] Dev experience is smooth (fast rebuilds, good errors)
- [ ] Output is still simple web components

---

## Notes

- This is a learning project first, production tool second
- Prioritize simplicity and understandability over features
- Each phase should result in a working, usable state
- Document learnings and tradeoffs
- It's okay to change direction based on discoveries
