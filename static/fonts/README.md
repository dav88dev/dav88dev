# Inter Font Files

This directory contains the Inter variable font files and CSS for local hosting.

## Files

- `inter-variable.woff2` - Inter variable font (latin characters, 48KB)
- `inter-variable-latin-ext.woff2` - Inter variable font (extended latin characters, 85KB)
- `inter.css` - CSS file with @font-face declarations and utility classes

## Usage

### Include the CSS

```html
<link rel="stylesheet" href="/static/fonts/inter.css">
```

### Use in CSS

```css
body {
  font-family: 'Inter', sans-serif;
  font-weight: 400; /* or any weight from 300-700 */
}

/* Using utility classes */
.heading {
  font-weight: 600; /* semibold */
}

/* Using CSS custom properties */
.text {
  font-weight: var(--font-weight-medium); /* 500 */
}
```

### Available Weights

- 300 (Light) - `--font-weight-light`
- 400 (Regular) - `--font-weight-regular` 
- 500 (Medium) - `--font-weight-medium`
- 600 (Semibold) - `--font-weight-semibold`
- 700 (Bold) - `--font-weight-bold`

### Utility Classes

- `.font-inter` - Apply Inter font family
- `.font-light` - Font weight 300
- `.font-regular` - Font weight 400
- `.font-medium` - Font weight 500
- `.font-semibold` - Font weight 600
- `.font-bold` - Font weight 700

## Font Information

- Font Family: Inter
- Version: v19
- Format: WOFF2 Variable Font
- Weight Range: 300-700
- Character Sets: Latin, Latin Extended