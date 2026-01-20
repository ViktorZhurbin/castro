# Reef Roadmap

## 📚 Documentation

### User Guides

Build Reef's own docs site with Reef!

- Quick start: "From static to your first island"
- Folder structure and routing conventions
    - Document routing priority/conflicts
- Config file reference (reef.config.js)

### Island Usage

- Component naming conventions (Counter.jsx → counter-solid)
- Props and attributes (how to pass data to islands)
- Web component wrapper pattern explanation

### Examples

- Simple nested components
- Complex example: mini dashboard with multiple islands


## 🎨 Features

### JSX Pages v2 - Layout Support

- Support CSS imports!
- Support component imports!


### Configuration

- Make paths configurable via reef.config.js
  - `contentDir`, `pagesDir`, `layoutsDir`, `outputDir`
  - Currently hardcoded in constants/dir.js

### Developer Experience

- reef create <project-name> CLI command (scaffold new projects)


## ⚡ Production Ready

### HTML parsing

Consider using a proper HTML parser to traverse and update the DOM tree instead of regex'ing html strings.

### Performance

- Minify JS in production builds

```js
// In island compilers
await esbuild.build({
  // ... existing config
  minify: process.env.NODE_ENV === 'production',
});
```

- Content hash in filenames (cache busting).
```js
// Only rebuild changed files
const cache = new Map();
if (cache.get(filePath) === hash(content)) {
  return; // Skip rebuild
}
```
- CSS bundling and optimization
```js
// Granular updates (CSS without page reload)
if (changedFile.endsWith('.css')) {
  broadcast({ type: 'css-update', href: '/styles.css' });
} else {
  broadcast({ type: 'reload' });
}
```

### Testing

- Define testing strategy (unit? integration? e2e?)
- Test island detection and injection
- Test layout resolution cascade
