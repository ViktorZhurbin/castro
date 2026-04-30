---
title: What is Island Architecture?
layout: docs
path: /concept/island-architecture
---

# What is Island Architecture?

A pattern for building websites that are mostly static, with small interactive regions where you actually need them. The static parts ship as plain HTML. The interactive parts ship JavaScript only when needed.

That's it. The rest of this page is about why that simple idea matters, and what it replaces.

## The problem it answers

Take a typical product page. A header, some prose, an image, a price, a footer. Maybe one button that opens a modal. Maybe a small "add to cart" widget.

If you build that page with a single-page application framework — React, Vue, Angular — the browser receives an empty HTML shell and a JavaScript bundle. The bundle boots, parses, builds a virtual representation of the page in memory, and renders it into the DOM. The header is JavaScript. The prose is JavaScript. The image is wrapped in a JavaScript component. The price is interpolated by JavaScript. None of it needs to be.

You shipped a runtime to render content that never changes after page load.

This is fine when the entire page is dynamic — a chat client, a code editor, a spreadsheet. But many pages are mostly text and images, with one or two genuinely interactive parts.

## The other extreme

The opposite of "everything is JavaScript" is "nothing is JavaScript." Plain HTML, server-rendered, like the web in 1998. Fast, accessible, easy to cache, easy to index, easy to read.

The trouble is that genuinely interactive components do exist. A search box with autocomplete. A form with live validation. A chart that responds to your cursor. These aren't things you can build with HTML and a `<form>` tag alone. You need JavaScript.

So the question becomes: how do you write *mostly* HTML and *some* JavaScript, without the JavaScript dragging the rest of the page into its world?

## Islands

The answer the pattern proposes is structural. You write the page as static HTML. Anywhere you need interactivity, you mark a region as an *island* — a self-contained interactive component, isolated from everything around it.

At build time, the island gets two outputs:

1. The HTML it would render if it were static. This goes into the page like any other content.
2. The JavaScript needed to make it interactive. This sits as a separate bundle, ready to load.

When the browser receives the page, the static HTML is already there. The page is visible. The user can read, scroll, click links. Then, independently, each island loads its JavaScript and *hydrates* — attaches behaviour to the HTML that already exists. The island becomes interactive in place, without re-rendering the page around it.

The rest of the page never had JavaScript and never will. It's an island only on the part that needs to be one.

## Why "island"

The metaphor is geographic. The page is an ocean of static HTML. Each interactive component is an island rising out of it — bounded, self-contained, with its own ecosystem. Islands don't share JavaScript runtime, don't communicate by default, don't depend on each other. Crucially, you can have many islands on a page, or none, and the page works the same way either way.

The metaphor is doing two jobs at once. First, it captures the spatial isolation: each interactive region is a discrete unit, not part of a connected app graph. Second, it captures the *exception* nature of interactivity: in a typical page, static content is the rule, islands are the exception. Most of the surface is water.

This is the inverse of single-page architecture, where the whole page is one giant island and the ocean has been drained.

## What hydration actually is

A word worth pinning down, because it sounds more dramatic than it is.

Hydration is the moment a region of static HTML — already painted on screen — gets its JavaScript behaviour attached. The HTML doesn't change. The DOM doesn't get rebuilt. A script runs, finds the existing elements, registers event listeners, sets up reactive state, and then the region responds to clicks and input.

Before hydration: the island looks right, but clicking it does nothing.
After hydration: the same island, now interactive.

The user usually can't see the difference, because for most components the visual result is identical. The difference is only in behaviour.

## When islands hydrate

A naïve implementation would hydrate every island the moment the page loads. That works, but it gives back some of what static HTML earned us — the page would be visible immediately but the browser would still be busy parsing and executing JavaScript bundles in the background, contending with other work.

So most island implementations let you choose when each island hydrates. Common strategies:

- **Eagerly**, as soon as the JavaScript loads. Right for things the user will interact with immediately — a header search box, for example.
- **When idle**, after the page has finished its critical work. Right for components the user might use, but not in the first second.
- **When visible**, only once the island scrolls into view. Right for anything below the fold. An interactive widget at the bottom of the page may never be seen, and so should never load its JavaScript.

These aren't features of the pattern; they're a consequence of it. Once each island is independent, you have the freedom to defer each one independently. A single-page application can't do this — its hydration is all-or-nothing because the entire page is one tree.

## What this gets you

Three things, mostly.

**Less JavaScript shipped.** The static parts of the page send no JavaScript at all. The interactive parts send only the JavaScript they specifically need. A page with one small interactive widget ships a small bundle. A page with no interactive widgets ships zero. This sounds obvious, but it's the headline benefit and it compounds across a site.

**Faster time to visible.** The HTML is already there when the page loads. The user sees something useful immediately, even before JavaScript has finished loading. On slow connections this is the difference between a usable page and a blank one.

**Independent failure.** If one island's JavaScript fails to load — bad network, broken bundle, browser quirk — every other island still works, and the static content is unaffected. A single-page application that fails to boot shows the user nothing at all. An island-based page degrades to a static version of itself, which is often still useful.

## What this costs you

Two things, mostly.

**Cross-island state is harder.** Islands don't share a runtime by default. If two interactive widgets on the same page need to coordinate — say, a filter in the sidebar updating a list in the main column — you have to do that coordination explicitly. You can't just lift state to a parent component, because there's no parent component in the SPA sense; the page is HTML. Solutions exist (custom events, a shared store, URL state), but the framework isn't going to do it for you. For most sites this never comes up. For sites where it does, you may want a different architecture.

**Page-level reactivity is gone.** If your application's value lies in a single, deeply interconnected interface — Figma, Notion, Google Sheets — the island pattern is wrong for you. Those are appropriate single-page applications. Use one. Islands are for everything else: marketing sites, blogs, documentation, e-commerce, dashboards with mostly read-only content. The 90% of the web that doesn't need to be an app.

<div class="btn-group">
  <a href="/how-it-works" class="btn btn-base">
    Next: How Castro Implements Islands →
  </a>
</div>
