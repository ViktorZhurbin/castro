---
title: Plugins - Castro Guide
layout: docs
path: /guide/plugins
section: guide
---

# PLUGINS

The Party approves extensions. Plugins hook into Castro's build pipeline to inject assets, process files, and register new island frameworks - keeping the core small while the ecosystem grows.

For the complete plugin API reference, see [Plugin API →](/reference/plugin-api).


## Using a Plugin

Add plugins to the `plugins` array in `castro.config.js`:

```javascript
import { castroJsx } from "@vktrz/castro-jsx";
import { tailwind } from "@vktrz/castro-tailwind";

export default {
  plugins: [castroJsx(), tailwind({ input: "styles/app.css" })],
};
```

See [packages/](https://github.com/ViktorZhurbin/castro/tree/main/packages) for full plugin examples.

-----

<div class="flex flex-wrap gap-4">
  <a href="/guide/components-islands" class="btn btn-outline btn-primary">
    ← Components & Islands
  </a>
  <a href="/reference/plugin-api" class="btn btn-outline btn-primary">
    Plugin API →
  </a>
</div>

