This is a compelling moment to revisit this. You are correct that the landscape has changed significantly with recent Bun updates.
As a Principal Engineer evaluating this architectural switch for "Castro" (an educational SSG), my verdict is that the value proposition has shifted from "marginal speed gains" to "massive architectural simplification."
Here is the evaluation of porting Castro to Bun v1.3.8+.
1. Architectural Perspective: The "Disk Write" Bottleneck
You identified the friction point correctly: Module Loading.
In Node.js (current Castro), you compile a page to a string (via esbuild) but have to write it to node_modules/.cache to import() it reliably. You were hoping Bun would allow you to import(string) directly from memory.
The Reality:
You still should write to disk, but you should stop viewing it as a "disappointment" and view it as correct architecture.
 * Why you can't (easily) import from memory: Even in Bun, if you compile a string that contains import { h } from "preact", and you try to eval or import that string as a data: URI, the runtime loses the context of where node_modules is. You end up having to reimplement module resolution manually.
 * Why writing to .cache is better: It gives you a stable URL for the module graph. It allows source maps to work automatically. It lets users inspect the "compiled" output when debugging.
 * The Bun difference: Bun's file I/O (Bun.write) is significantly faster than Node's fs.writeFile. The "boilerplate" of writing to a temp file in Bun is literally one line:
   await Bun.write(tempPath, compiledCode);

   This feels less like "boilerplate" and more like a standard build step.
Architectural Verdict: The complexity of avoiding the disk write is higher than the cost of doing it. Embrace the .cache folder. It is not a hack; it is a build artifact.
2. Dependency Reduction: The "Massive Clean-up"
This is where the argument for Bun becomes undeniable. With Bun v1.3.8, you can potentially remove 5 major dependencies.

| Current Stack (Node) | Bun Equivalent | Action |
|---|---|---|
| esbuild | Bun.build | Remove. Bun's bundler API is now stable enough for this. |
| marked | Bun.file().text() + Bun.markdown | Remove. Bun v1.3.8 added a native, high-performance Markdown parser. |
| gray-matter | Bun.file().text() + Bun.YAML | Remove. You can split the frontmatter string manually (simple regex) and use the native Bun.YAML.parse() introduced recently. |
| polka | Bun.serve | Remove. |
| sirv | Bun.serve (static) | Remove. |

The Dev Server (Bun.serve):
Your previous blocker was MIME types and static assets. That is solved. You do not need Hono or Elysia for this anymore. Bun.serve combined with Bun.file automatically handles MIME types.
Here is your entire dev server in Bun:
import { serve, file } from "bun";

serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    
    // 1. Serve static files (MIME types are automatic!)
    let filePath = `./dist${url.pathname}`;
    if (url.pathname.endsWith("/")) filePath += "index.html";
    
    const asset = file(filePath);
    if (asset.size > 0) return new Response(asset);

    // 2. 404
    return new Response("Not Found", { status: 404 });
  }
});

This replaces your polka + sirv setup entirely with standard library code.
3. Educational Perspective: "Novelty vs. Clarity"
This is the strongest argument for the switch.
 * Readability: Compare fs.readFile / fs.promises with await Bun.file('path').text(). The Bun API is more "human-readable," which aligns perfectly with an educational project.
 * The "Install" Barrier: You are worried about users needing to install Bun.
   * Counter-point: Since Castro is a "Framework" (educational one), users usually run it via a package script. In CI/CD, installing Bun is fast.
   * The "Cool" Factor: Educational projects thrive on being slightly "ahead of the curve." Teaching people Island Architecture and Bun simultaneously positions Castro as a "modern" reference implementation, rather than "just another Node script."
 * Native TypeScript: You can delete your tsconfig.json or keep it very minimal. You can delete all @types/node imports. The code looks cleaner on screen because you don't have to explain "why we are bundling this config file."
4. Implementation Feasibility Check
I checked your specific constraints against Bun's current capabilities:
 * Native Markdown: Confirmed. Bun.markdown.toHTML(string) exists in v1.3.8. It is faster than marked.
 * Virtual Entry (Islands): Confirmed. Bun.build supports Plugins just like esbuild. You can use a plugin to intercept the island import and inject the .islandId property, exactly as you do now.
 * Re-heating JSX: Confirmed. Bun transpiles JSX/TSX out of the box.
 * Static Files: Confirmed. Bun.file(path) returns a BunFile blob with the correct type property (MIME type) inferred from the extension.
Final Recommendation
Go for the switch.
The reduction from ~7 production dependencies down to 2 (preact, preact-render-to-string) is structurally beautiful for an educational project. It proves the point that "modern web development doesn't need a heavy toolchain."
The Plan:
 * Accept the file write: Keep writing compiled pages to .cache. It makes the architecture robust.
 * Drop the server framework: Use raw Bun.serve + Bun.file. It is extremely concise now.
 * Drop the parser libs: Use Bun.markdown and Bun.YAML.
 * Marketing: Rebrand Castro slightly as "The Modern Educational SSG" — running on the bleeding edge to show how simple web dev can be.
