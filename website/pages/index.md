---
title: Castro - Island Architecture Framework
---

# Castro

*An educational framework for understanding island architecture*

Castro is a working Static Site Generator that implements island architecture in ~1500 lines of well-commented, readable code. The communist theme makes it memorable. The architecture lessons are real.

## The Revolutionary Directives

Castro supports three hydration strategies. Add them directly to your components:

### `no:pasaran` - Static Only

Component renders at build time, no JavaScript shipped to client.

*"They shall not pass (to the client)"*

<preact-counter no:pasaran data-initial="5"></preact-counter>

This counter above is pure HTML. Click it - nothing happens. No JS was sent to your browser.

### `lenin:awake` - Immediate Hydration

Component becomes interactive as soon as the page loads.

*"The leader is always ready"*

<preact-counter lenin:awake data-initial="10"></preact-counter>

This counter is interactive immediately. JavaScript loaded on page load.

### `comrade:visible` - Lazy Load

Component becomes interactive when scrolled into viewport (default).

*"Only work when the people are watching"*

<preact-counter comrade:visible data-initial="15"></preact-counter>

This counter loads JavaScript only when you scroll it into view. Check your Network tab!

---

## How It Works

1. **Build time**: All three counters render to static HTML
2. **Page load**: HTML displays instantly (all three visible)
3. **Hydration**: JavaScript loads based on directive
   - `no:pasaran`: Never loads JS
   - `lenin:awake`: Loads immediately
   - `comrade:visible`: Loads when scrolled into view

Result: Fast initial page load, progressive enhancement, minimal JavaScript.

## More Examples

- [Interactive Islands Demo](/islands-preact.html)
- [Counter Component Demo](/demo/counter.html)
- [About](/about/)

---

*Workers of the web, unite! Seize the means of rendering.*
