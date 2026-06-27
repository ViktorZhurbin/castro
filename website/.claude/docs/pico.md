# Customization

## CSS variables

Pico includes many custom properties (variables) that allow easy access to frequently used values such as font-family, font-size,border-radius, margin, padding, and more.

All CSS variables are prefixed with pico- to avoid collisions with other CSS frameworks or your own vars. You can remove or customize this prefix by recompiling the CSS files with SASS.

You can define the CSS variables within the :root selector to apply the changes globally or overwrite the CSS variables on specific selectors to apply the changes locally.

Example:

```html
<style>
  :root {
    --pico-border-radius: 2rem;
    --pico-typography-spacing-vertical: 1.5rem;
    --pico-form-element-spacing-vertical: 1rem;
    --pico-form-element-spacing-horizontal: 1.25rem;
  }
  h1 {
    --pico-font-family: Pacifico, cursive;
    --pico-font-weight: 400;
    --pico-typography-spacing-vertical: 0.5rem;
  }
  button {
    --pico-font-weight: 700;
  }
</style>
```

## CSS variables for color schemes

To add or edit CSS variables for light mode only (the default mode), define them inside:

```css
/* Light color scheme (Default) */
/* Can be forced with data-theme="light" */
[data-theme="light"],
:root:not([data-theme="dark"]) {
 ...
}
```

To add or edit CSS variables for dark mode, you need to define them twice.

The first inclusion is in the `@media` query that checks if the user has dark mode enabled through their device settings with `prefers-color-scheme: dark`. In this case, the dark mode styling is applied to the :root element if there is no explicit data-theme attribute set.

The second inclusion is when you force the dark mode with `data-theme="dark"`. This allows you to manually toggle between the light and dark themes regardless of the user’s device settings.

```css
/* Dark color scheme (Auto) */
/* Automatically enabled if user has Dark mode enabled */
 @media only screen and (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    ...
  }
}

/* Dark color scheme (Forced) */
/* Enabled if forced with data-theme="dark" */
[data-theme="dark"] {
  ...
}
```

Detailed example to override the primary color:

```css
/* Orange color for light color scheme (Default) */
/* Can be forced with data-theme="light" */
[data-theme=light],
:root:not([data-theme=dark]),
:host:not([data-theme=dark]) {
  --pico-text-selection-color: rgba(244, 93, 44, 0.25);
  --pico-primary: #bd3c13;
  --pico-primary-background: #d24317;
  --pico-primary-underline: rgba(189, 60, 19, 0.5);
  --pico-primary-hover: #942d0d;
  --pico-primary-hover-background: #bd3c13;
  --pico-primary-focus: rgba(244, 93, 44, 0.5);
  --pico-primary-inverse: #fff;
}

/* Orange color for dark color scheme (Auto) */
/* Automatically enabled if user has Dark mode enabled */
@media only screen and (prefers-color-scheme: dark) {
  :root:not([data-theme]),
  :host:not([data-theme]) {
    --pico-text-selection-color: rgba(245, 107, 61, 0.1875);
    --pico-primary: #f56b3d;
    --pico-primary-background: #d24317;
    --pico-primary-underline: rgba(245, 107, 61, 0.5);
    --pico-primary-hover: #f8a283;
    --pico-primary-hover-background: #e74b1a;
    --pico-primary-focus: rgba(245, 107, 61, 0.375);
    --pico-primary-inverse: #fff;
  }
}
/* Orange color for dark color scheme (Forced) */
/* Enabled if forced with data-theme="dark" */
[data-theme=dark] {
  --pico-text-selection-color: rgba(245, 107, 61, 0.1875);
  --pico-primary: #f56b3d;
  --pico-primary-background: #d24317;
  --pico-primary-underline: rgba(245, 107, 61, 0.5);
  --pico-primary-hover: #f8a283;
  --pico-primary-hover-background: #e74b1a;
  --pico-primary-focus: rgba(245, 107, 61, 0.375);
  --pico-primary-inverse: #fff;
}
```

See ./pico-variables-css.md for the full list.

## Sass

Build your own minimal design system by compiling a custom version of Pico CSS framework with SASS.

To get the most out of Pico, we recommend compiling your own version with SASS. This way, you can include only the required modules and personalize the settings without overriding CSS styles.

Avoid modifying Pico’s core files whenever possible. This approach allows you to keep Pico up to date without conflicts since the Pico code and your custom code are separated.

### Import

You can import Pico into your SCSS file with `@use "pico";`

If you are using Sass Command-Line Interface to compile your .scss files, you can define the load path using `sass --load-path=node_modules/@picocss/pico/scss/` to avoid using relative URLs like `@use "node_modules/@picocss/pico/scss/pico";`

If you are using React, or Webpack with sass-loader, the default configuration will automatically resolve the path to node_modules so you can simply import Pico with `@use "@picocss/pico/scss/pico";`

### Settings

You can set custom settings with `@use "pico" with ( ... );`. These custom values will override the default variables.

Here is an example to generate the classless version:

```scss
// Pico classless version
@use "pico" with (
  $enable-semantic-container: true,
  $enable-classes: false
);
```

Example to generate a lightweight version without `.classes`, uncommon form elements, and components.

This version reduces the weight of Pico by ~50%.

```scss
// Pico lightweight version
@use "pico" with (
  $enable-semantic-container: true,
  $enable-classes: false,
  $modules: (
    "content/code": false,
    "forms/input-color": false,
    "forms/input-date": false,
    "forms/input-file": false,
    "forms/input-range": false,
    "forms/input-search": false,
    "components/accordion": false,
    "components/card": false,
    "components/dropdown": false,
    "components/loading": false,
    "components/modal": false,
    "components/nav": false,
    "components/progress": false,
    "components/tooltip": false,
    "utilities/accessibility": false,
    "utilities/reduce-motion": false
  )
);
```

See ./pico-variables-sass.md for the full list.

### Theme color

Pico comes with a default "azure" theme.
You can easily recompile Pico using a different primary color from a selection of 20 colors.

```scss
// Pico with purple primary color
@use "pico" with (
  $theme-color: "purple"
);
```

Possible color choices: amber, azure, blue, cyan, fuchsia, green, grey, indigo, jade, lime, orange, pink, pumpkin, purple, red, sand, slate, violet, yellow, zinc.

### Custom theme

To create a custom version of Pico with a fully custom theme that reflects your brand identity, you can:

1. Exclude the default theme from compilation,
2. Import your custom theme (you can duplicate [Pico’s default theme](https://github.com/picocss/pico/tree/main/scss/themes/) as a starting point and customize it to match your brand’s style).

```scss
// Pico without default theme
@use "pico" with (
  $modules: (
    "themes/default": false
  )
);

// Your custom theme
@use "path/custom-theme";
```
