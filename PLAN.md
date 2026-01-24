# Castro Framework - Development Instructions

## Project Overview

Castro is a satirical educational Static Site Generator that teaches island architecture through ~1500 lines of well-commented code. Built on the existing Reef codebase, it wraps serious technical implementation in communist-themed presentation.

**Core Philosophy:**
- Code is serious, clean, and educational
- Satire is in presentation layer only (CLI, errors, docs, naming)
- Educational value takes priority over jokes
- <1500 LOC of actual code + ~1000 LOC of explanatory comments

## What We're Building

### Educational Core
- Working SSG with island architecture
- Selective hydration (only interactive components get JS)
- SSR/SSG with build-time rendering
- Simple, readable codebase that teaches by example
- Every file has explanatory comments showing "why" not just "what"

### Communist Wrapper (Satire Layer)
- CLI with themed output ("Consulting Central Committee...")
- Error messages from "The Ministry of Errors"
- Config file: `manifesto.js`
- Hydration directives: `no:pasaran`, `lenin:awake`, `comrade:visible`
- Marketing copy with communist puns

### The Value Proposition
"Understand how modern SSGs implement island architecture by reading <1500 lines of commented code. The communist theme makes it memorable. The architecture lessons are real."

---

## Phase 1: Foundation Work

### Task 1.1: Restructure File Tree
**Goal:** Dead-simple, self-explanatory directory structure

**Current state:** Reef has existing structure
**Target state:** Someone opens repo and immediately understands layout

**Action:**
1. Create `STRUCTURE.md` at root documenting current organization
2. Propose simplified structure (consider: `/core`, `/cli`, `/bundler`, `/parser`, `/runtime`)
3. Each folder name should explain its purpose
4. Reorganize files if needed for clarity

**Success criteria:**
- Directory structure is logical and minimal
- No ambiguity about where code lives
- STRUCTURE.md explains architectural organization

---

### Task 1.2: Documentation Strategy
**Goal:** Choose consistent approach for types and comments

**Decision:** Use JSDoc comments inline with code
- Types live with implementation (not separate .d.ts files)
- Better for educational reading flow
- Everything in one place for learners

**Action:**
1. Use JSDoc syntax for all type annotations
2. Keep TypeScript types inline via JSDoc
3. Avoid separate .d.ts files (adds friction for learning)

**Example style:**
```javascript
/**
 * Selective Hydration Controller
 * 
 * This is the core of island architecture. Instead of hydrating
 * everything at once (like traditional SPAs), we wait for specific
 * conditions based on the directive used.
 * 
 * Educational note: The "magic" is just IntersectionObserver API
 * and some conditional script tag injection. No framework needed.
 * 
 * @param {HTMLElement} element - The island component to hydrate
 * @param {string} directive - Hydration strategy (no:pasaran, lenin:awake, etc)
 */
function hydrateIsland(element, directive) {
  // Implementation...
}
```

---

### Task 1.3: Add Educational Comments
**Goal:** ~1000 lines of explanatory comments across the codebase

**Guidelines:**
- Every function gets: what it does, why it exists, how it works
- Comments explain concepts, not just code
- Write for someone learning islands architecture
- Show the "why" behind decisions
- Point out patterns that apply to other frameworks

**Action:**
Go file by file adding:
1. File-level comment explaining module purpose
2. Function-level comments with educational context
3. Inline comments for non-obvious logic
4. "Educational note:" sections explaining broader concepts

**Success criteria:**
- Code is self-teaching
- A developer can read through and understand islands
- Comments add educational value, not noise
- ~1000 LOC of comments across ~1500 LOC of code

---

## Phase 2: Communist Wrapper

### Task 2.1: Rename and Rebrand
**Goal:** Transform Reef → Castro

**Action:**
1. Update package.json: name to "castro"
2. Rename config file support: `manifesto.js` (keep backward compat if needed)
3. Update all internal references
4. Update README with new branding

**Success criteria:**
- All references say "Castro"
- Config file is `manifesto.js`
- No "Reef" references remain

---

### Task 2.2: Implement CLI with Themed Output
**Goal:** Communist-themed commands and logging

**Commands:**
- `castro` or `castro plan` - dev server
- `castro build` - production build
- `castro purge` - clean build artifacts

**The Ministry of Logs (build output):**
```
✓ Consulting the Central Committee...
✓ Redistributing bytes...
✓ The Five-Year Plan completed ahead of schedule

  Bundle: 12kb (gzipped)
  Pages: 47
  Build time: 1.2s
```

**Deploy success:**
```
✅ The revolution is complete.
Your site is now owned by the people.
```

**Implementation approach:**
- Wrap existing Vite/build commands
- Replace console output with themed messages
- Keep it as thin wrapper over existing functionality
- Store all message text in `messages.js` for easy editing

**Success criteria:**
- CLI commands work with new names
- Output is themed but informative
- Underlying build process unchanged

---

### Task 2.3: The Ministry of Errors
**Goal:** Satirical but helpful error messages

**Principles:**
- Sound official and ideologically pure
- Sound morally judgmental
- Still be actually helpful for debugging

**Best error messages:**

Bundle size warnings:
```
⚠️ The Kulaks are hoarding bytes!
Your bundle exceeds the grain quota by 500kb.
Component <Gallery /> controls 78% of total bundle size.
Redistribute your imports immediately.
```

Runtime errors:
```
❌ Runtime mutation of build-time constants is forbidden.
History cannot be rewritten.
```

Infinite loops:
```
⚠️ Permanent Revolution detected in <Counter />.
While ideologically sound, the browser is out of resources.
The state has collapsed.
```

Conflicting directives:
```
❌ Ideological inconsistency detected.
`no:pasaran` used together with `lenin:awake`.
You cannot both abolish and deploy JavaScript.
Choose a side, Comrade.
```

Build failures:
```
❌ The Five Year Plan has been sabotaged from within.
Check your syntax for counter-revolutionary tendencies.

  File: components/Hero.jsx:14
  Error: Unexpected token
```

**Implementation:**
1. Create `src/messages.js` with all error text
2. Map technical errors to satirical messages
3. Keep modular (can toggle serious/funny mode)
4. Start with 5-10 best messages, expand later
5. Always include actual error info alongside satire

**Success criteria:**
- Errors are funny but informative
- Debug info is still present
- Messages don't obscure actual problems

---

### Task 2.4: Implement Hydration Directives
**Goal:** 3 core directives with communist naming

**Directives to implement:**

1. **`no:pasaran`** (Static only)
   - Component renders at build time
   - No JavaScript shipped to client
   - Tagline: "JS shall not pass the border to the client"

2. **`lenin:awake`** (Load immediately)
   - Hydrate on page load
   - Interactive from start
   - Tagline: "The leader is always ready"

3. **`comrade:visible`** (Load when visible)
   - Hydrate when scrolled into viewport
   - Uses IntersectionObserver
   - Tagline: "Only work when the people are watching"

**Optional (if trivial):**
4. **`party:priority`** (High priority load)
   - Eager loading with high priority
   - Tagline: "This component is more equal than others"

**Implementation notes:**
- These map to existing island hydration logic
- Mostly aliasing/renaming of existing patterns
- `no:pasaran` = no client JS
- `lenin:awake` = client:load
- `comrade:visible` = client:visible

**Success criteria:**
- All 3 directives work correctly
- Behavior matches expectations
- Well documented in code comments

---

## Phase 3: Documentation Site

### Task 3.1: Create Docs Site Structure
**Goal:** Documentation site built with Castro itself (dogfooding)

**Required pages:**
1. **Homepage/Manifesto**
   - Hook: "The Educational Island Architecture Framework (That Happens to Be Communist)"
   - Tagline: "Learn how modern SSGs work by reading <1500 lines of well-commented code"
   - "The satire is optional. The knowledge is real."
   - CTA buttons: [Manifesto] [Source Code] [Tutorial]

2. **The Manifesto (Introduction)**
   - What is island architecture (serious)
   - Why it matters for performance (serious)
   - How Castro implements it (serious)
   - Why we made it funny (meta/honest)

3. **Revolutionary Principles (Core Concepts)**
   - Each principle explains a real concept
   - Communist framing makes it memorable
   - Example: "Central Planning (Build-Time Rendering)"
     - Serious explanation of SSG benefits
     - Satirical framing: "The state decides what renders"

4. **The Codebase Tour**
   - Annotated walkthrough of the source
   - "This is the parser, here's how it works..."
   - "This is hydration, here's the technique..."
   - Learn by reading, not guessing

5. **404 Page**
   - "This page has been redacted by the Ministry of Truth. It never existed."

6. **About Page**
   - "From each component according to its complexity, to each page according to its needs."
   - Explain it's educational, satire is wrapper
   - Zero-config, maximum-discipline philosophy

**Success criteria:**
- Site is built using Castro
- All pages render correctly
- Navigation works
- Demonstrates framework capabilities

---

### Task 3.2: Write Educational Content
**Goal:** Content that actually teaches islands architecture

**Priority order:**
1. Manifesto page (hook people)
2. One complete tutorial ("Build your first Castro site")
3. Codebase tour (architecture walkthrough)
4. API reference (directives, config)

**Don't write everything at once:**
- Start with manifesto + one tutorial
- Expand based on feedback
- Quality over quantity

**Tutorial should:**
- Walk through building a simple site
- Explain each step's purpose
- Show the island architecture in action
- Reference code comments for deeper learning

**Success criteria:**
- One complete, working tutorial exists
- Manifesto explains value proposition clearly
- Content teaches, doesn't just describe

---

### Task 3.3: Add Examples
**Goal:** Working examples demonstrating concepts

**Required examples:**
1. **Simple blog** - Static pages, no islands
2. **Interactive components** - Islands demo (counter, form, etc)
3. **Real-world use case** - Practical application

**Each example:**
- Demonstrates one concept clearly
- Includes code comments
- Shows both static and interactive patterns
- Can be copy-pasted as starter

**Success criteria:**
- Examples work out of the box
- Each teaches a specific concept
- Code is clean and commented

---

## Phase 4: Polish & Launch

### Task 4.1: Perfect README
**Goal:** README that sells the educational value

**Structure:**
```markdown
# Castro 🚩

*An educational framework for understanding island architecture*

Castro is a working Static Site Generator that implements 
island architecture in <1500 lines of readable code. The 
communist theme makes it memorable. The code makes it useful.

## Why Castro Exists

Most SSG tutorials gloss over **how** islands actually work. 
Castro is the tutorial. Every file includes explanatory 
comments. The entire codebase is designed to be read.

## What You'll Learn

- How to parse and transform JSX/templates
- Build-time vs runtime rendering strategies
- Selective hydration implementation
- Dev server architecture
- Plugin systems

## Quick Start

[Installation and basic usage]

## The Revolutionary Directives

While learning, you get communist-themed hydration directives:

- `no:pasaran` - Static render only (no JS shipped)
- `lenin:awake` - Hydrate on page load
- `comrade:visible` - Hydrate when visible

These map to standard patterns. The names just make them 
more memorable while learning.

## Documentation

[Link to docs site]

## Contributing

This is an educational project. PRs welcome if they:
- Improve code clarity/comments
- Add tutorial content
- Fix bugs
- Enhance educational value

Joke PRs are fun but secondary to learning value.

## License

MIT - The people's license

---

⚠️ **Note:** This framework is satire, but the code is real.
The communist theme is for memorability while learning.
The architecture lessons transfer to any modern SSG.
```

**Success criteria:**
- README clearly explains value
- Code example shows directives
- Educational focus is obvious
- Contributing guidelines set expectations

---

### Task 4.2: Marketing Assets
**Goal:** Visual content for sharing

**Create:**
1. Screenshot of CLI output (Ministry of Logs)
2. Screenshot of error message (Ministry of Errors)
3. Code snippet showing directives in action
4. Bundle size comparison (before/after)

**Success criteria:**
- Professional-looking screenshots
- Easy to share on social media
- Show both satire and substance

---

### Task 4.3: Soft Launch
**Goal:** Get initial feedback without big push

**Action:**
1. Make GitHub repo public
2. Post on personal social accounts
3. Share in 2-3 relevant communities
4. Monitor feedback and questions

**Watch for:**
- What confuses people?
- What questions come up?
- What features do they want?
- Does satire help or hurt?

**Success criteria:**
- Repo is public and accessible
- Initial feedback collected
- No major confusion/blockers

---

## Future Roadmap (Don't Build Now)

Track these for later, after launch feedback:

- [ ] Custom `.castro` file syntax (DSL with frontmatter fence)
- [ ] IDE extension for syntax highlighting
- [ ] Additional hydration directives
- [ ] Plugin system
- [ ] Themed error message presets (zen, corporate, etc)
- [ ] Advanced tutorial content
- [ ] Performance benchmarks vs other SSGs

---

## Quality Gates

Before moving to next phase, verify:

**Code Quality:**
- ✅ Can someone learn from this code right now?
- ✅ Are comments educational, not just descriptive?
- ✅ Is codebase under 1500 LOC (excluding comments)?

**Satire Balance:**
- ✅ Does satire enhance or distract from learning?
- ✅ Are errors still helpful despite jokes?
- ✅ Would you show this to a senior dev without embarrassment?

**Educational Value:**
- ✅ Does it actually teach islands architecture?
- ✅ Can someone read it and understand the concepts?
- ✅ Are examples clear and practical?

---

## Critical Principles

**Remember:**
1. **Code is serious, wrapper is funny** - Never sacrifice clarity for jokes
2. **Education first** - Satire makes it memorable, education makes it valuable
3. **Keep it simple** - <1500 LOC is a feature, not a limitation
4. **Comment generously** - Every function teaches something
5. **Dogfood it** - Docs site must be built with Castro
6. **Ship and iterate** - Launch with minimum viable content, expand based on feedback

---

## Puns & Slogans (For Marketing)

Use these in docs/marketing:

- "No component hoards JS unless it is socially necessary"
- "Workers of the web, unite!"
- "The performance is... mandatory"
- "Bundle sizes will be redistributed equally"
- "Seize the means of rendering"
- "Your 5-year plan to understand islands architecture"
- "Coming to npm after the revolution 🚩"

---

## What Success Looks Like

**Launch state:**
- Codebase is educational-ready (<1500 LOC + ~1000 LOC comments)
- CLI works with themed output
- 3 directives implemented and documented
- Docs site exists with at least one tutorial
- README sells the concept
- Soft launched on 2-3 platforms

**Long-term success:**
- People say "I learned islands by reading Castro"
- Used as educational resource
- Community contributes improvements
- Referenced in tutorials/blog posts
- GitHub stars (quantity less important than quality engagement)

---

## Next Immediate Actions

1. Document current Reef file structure in STRUCTURE.md
2. Decide if reorganization needed
3. Start adding educational comments to one file as test
4. This reveals pace and style that works

Then proceed through phases sequentially.