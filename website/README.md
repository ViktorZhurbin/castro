# Castro website — voice and presentation

Read this before writing or changing any site copy. Visual rules live in `DESIGN.md`.

## What the site is

Castro is a personal hobby project: one person built a small static site generator with an LLM over three months, to understand how frameworks like Astro work by writing one. The site presents it the way a newspaper front page presents a story, not the way a vendor presents a product.

The reader is a curious developer — interested in islands, in small frameworks, or in the joke. They are reading, not evaluating a purchase.

The landing page has three jobs, in order:

1. Say what Castro is, in one screen.
2. Demonstrate an island live on the page (the Five-Year Plan, which loads its JavaScript only when scrolled into view).
3. Send the reader to the source.

The only calls to action are **Get started** (docs) and **Read the source** (GitHub).

**The failure mode is a SaaS landing page** — every design model drifts toward it by default. None of: pricing or plans, sign-up or email capture, logos or testimonials, star counts or usage stats as social proof, icon-plus-three-words feature grids, gradient heroes, marketing verbs ("supercharge", "seamless", "blazing fast"). The one number on the page, `1,350` lines, is a production tally the joke is built on, not a metric.

## The voice

Communist satire wrapped around a serious tool.

**Satire as a wrapper.** Jokes go in proper nouns, section titles, slogans, and illustrations — "The Means of Production", "The Standing Directives", `comrade:visible`. The explanatory prose underneath stays plain and technical. Keeping them separable is what lets the explanation stay clear.

**Satire does cognitive work.** It earns its place when it reframes a technical constraint so the constraint is more memorable, not just more decorated. `comrade:visible` — "only work when the people are watching" — is the model: the joke _is_ the hydration rule. The grandiosity-gap rule (grand language, small technical event) is in `core/src/messages/README.md`, and applies to site copy as much as to terminal messages.

**Self-irony about the LLM.** The page says openly that Castro was built with an LLM ("My Five-Year Plan to Build a Framework Over a Weekend … Delivered in three months, ahead of schedule").

**The satire commits.** A half-hearted constructivist poster reads as muddy, and muddy reads as SaaS. The visual side of this is `DESIGN.md`.

**Where the voice lives.** The landing page, `404`, and the islands in `src/components/islandExamples/` carry it. `docs/` is usage-only and stays plain informational.

## The copy

The landing copy is close to final. A redesign or restyle keeps every string; changing wording is its own change and needs asking for (root `CLAUDE.md` says the same for satirical copy). When a design mockup carries different copy than the site, the site's copy wins unless the user says otherwise.

## Reference material

- **`website/assets/space-castro.jpg`** is a reference for the register, not site art. It's a reminder to consider illustration in future work; don't wire it into a page as-is.
- **Past landing copy.** Earlier eras of the page, the drafts, and retired slogans (`no:pasaran`, `lenin:awake`) are kept at tag `landing-drafts`, under `website/landing-revamp/` — `landing-history-context.md` is the summary.
