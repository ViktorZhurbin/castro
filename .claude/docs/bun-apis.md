# Bun APIs — quick reference

Bun-specific APIs where the signature differs from Node. Standard Node-compatible APIs (node:fs, node:path, etc.) are not listed here.

---

## Bun.file / Bun.write

```ts
// Lazy file reference — no disk read on creation
const file = Bun.file("path/to/file.txt");
file.size;   // bytes
file.type;   // MIME type (default: "text/plain;charset=utf-8")

await file.text();        // string
await file.json();        // parsed JSON
await file.arrayBuffer(); // ArrayBuffer
await file.bytes();       // Uint8Array
await file.exists();      // boolean
await file.delete();

// Also accepts: file descriptor number, file:// URL
Bun.file(new URL(import.meta.url)); // reference to current file

// stdin/stdout/stderr are BunFile instances
Bun.stdin; Bun.stdout; Bun.stderr;

// Write — accepts string, Blob, BunFile, ArrayBuffer, TypedArray, Response
// Uses fastest available syscall per platform (copy_file_range, clonefile, etc.)
await Bun.write("out.txt", "content");
await Bun.write(Bun.file("out.txt"), Bun.file("in.txt")); // file copy

// Incremental writing
const writer = Bun.file("out.txt").writer({ highWaterMark: 1024 * 1024 });
writer.write("chunk");
writer.flush();  // flush buffer to disk
writer.end();    // flush + close (process stays alive until end() by default)
writer.unref();  // don't keep process alive
```

---

## Glob

```ts
import { Glob } from "bun";

const glob = new Glob("**/*.tsx");

// Async iterable scan
for await (const file of glob.scan(".")) { ... }

// Sync
for (const file of glob.scanSync({ cwd: "./src", dot: false, absolute: false })) { ... }

// Test a string
glob.match("foo.tsx"); // boolean
```

`ScanOptions`: `cwd`, `dot` (match dotfiles, default false), `absolute` (return absolute paths, default false), `followSymlinks` (default false), `onlyFiles` (default true).

Node compat — supports arrays of patterns and `exclude`:
```ts
import { promises } from "node:fs";
const files = await promises.glob(["**/*.ts", "**/*.js"], { exclude: ["node_modules/**"] });
```

---

## Bun.serve

```ts
const server = Bun.serve({
  port: 3000,
  development: true,          // enables error overlay, disables some optimizations
  idleTimeout: 0,             // seconds; 0 = disabled. Default 10s. Must disable for SSE/long streams.
  reusePort: false,           // Linux only — fail if port is already in use

  routes: {                   // requires Bun v1.2.3+
    "/": new Response("OK"),                           // static
    "/users/:id": req => new Response(req.params.id),  // dynamic, typed params
    "/api/*": Response.json({ error: "not found" }, { status: 404 }), // wildcard
    "/api/posts": { GET: listPosts, POST: createPost }, // method-specific
    "/favicon.ico": Bun.file("./favicon.ico"),         // file
  },

  fetch(req) {                // fallback for unmatched routes (required pre-1.2.3)
    return new Response("Not Found", { status: 404 });
  },
});

server.stop();        // stop accepting new connections
server.reload(config); // hot-swap config/routes without dropping connections
server.url;           // → URL object with actual bound address

// Per-request controls (called from inside fetch handler)
server.timeout(req, 0);      // disable idle timeout for this request (use for SSE)
server.requestIP(req);       // → { address, family, port }
```

`idleTimeout` note: the default 10s timeout applies to streaming responses too — a quiet SSE connection will be killed. Castro's dev server sets `idleTimeout: 0`.

---

## import.meta (Bun-specific properties)

```ts
import.meta.dir;      // "/absolute/path/to/dir"    (like __dirname)
import.meta.file;     // "filename.ts"
import.meta.path;     // "/absolute/path/to/filename.ts"  (like __filename)
import.meta.url;      // "file:///absolute/path/to/filename.ts"
import.meta.main;     // true if this is the bun run entrypoint
import.meta.resolve("preact"); // → absolute file:// URL to resolved module
```

`import.meta.dirname` and `import.meta.filename` are Node-compat aliases for `dir` and `path`.
