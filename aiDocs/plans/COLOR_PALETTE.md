# FiloSign Color Palette & Style Guide

This document defines the color palette and practical Tailwind CSS classes used throughout the FiloSign application.

## Design Principles

- **High Contrast**: All text must have sufficient contrast for accessibility
- **Chrome Filter Compatible**: Colors work well with Chrome accessibility filters
- **System Preference Aware**: Respects user's light/dark mode preferences

## Component Style Examples

### Primary Buttons
```css
.primary-button {
  @apply bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md font-medium;
  /* Light: dark-gray background, white text */
  /* Dark: white background, dark text */
}
```

### Secondary Buttons
```css
.secondary-button {
  @apply bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md;
  /* Light: light-gray background, dark text */
  /* Dark: dark-gray background, white text */
}
```

### Destructive/Cancel Buttons
```css
.destructive-button {
  @apply bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md;
  /* Light & Dark: red background, white text */
}
```

### Card Components
```css
.content-card {
  @apply bg-card text-card-foreground border border-border rounded-lg p-6 shadow-sm;
  /* Light: white background, dark text, light borders */
  /* Dark: dark-gray background, white text, darker borders */
}
```

### Form Inputs
```css
.form-input {
  @apply bg-input text-foreground border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-ring;
  /* Light: light-gray background, dark text */
  /* Dark: dark-gray background, white text */
}
```

### Text Styles
```css
.heading-text {
  @apply text-foreground font-semibold;
  /* Light: near-black text */
  /* Dark: white text */
}

.body-text {
  @apply text-foreground;
  /* Light: near-black text */
  /* Dark: white text */
}

.muted-text {
  @apply text-muted-foreground;
  /* Light: medium-gray text */
  /* Dark: light-gray text */
}
```

### Page Layouts
```css
.page-background {
  @apply bg-background min-h-screen;
  /* Light: white background */
  /* Dark: very-dark-blue-gray background */
}

.header-section {
  @apply bg-card/80 backdrop-blur-sm border-b border-border;
  /* Light: semi-transparent white with light border */
  /* Dark: semi-transparent dark-gray with darker border */
}
```

## Understanding the Naming Convention

### Key Concept: "Foreground" = Text Color for Specific Backgrounds

The naming can be confusing, so here's the logic:

- **`.text-foreground`** = Normal text color (dark in light mode, white in dark mode)
- **`.text-primary-foreground`** = Text color that goes ON TOP of a primary-colored element
- **`.text-secondary-foreground`** = Text color that goes ON TOP of a secondary-colored element

### Examples:
```html
<!-- Primary button with dark background needs white text -->
<button class="bg-primary text-primary-foreground">Click me</button>

<!-- Secondary button with light background needs dark text -->
<button class="bg-secondary text-secondary-foreground">Cancel</button>

<!-- Normal text on page background -->
<p class="text-foreground">This is normal body text</p>
```

## Color Token Reference

### Semantic Color Mapping
```css
/* Background Colors */
.bg-background     /* Light: white | Dark: very-dark-blue-gray */
.bg-card          /* Light: white | Dark: dark-gray */
.bg-popover       /* Light: white | Dark: dark-gray */
.bg-primary       /* Light: dark-gray | Dark: white */
.bg-secondary     /* Light: light-gray | Dark: dark-gray */
.bg-muted         /* Light: light-gray | Dark: dark-gray */
.bg-accent        /* Light: light-gray | Dark: dark-gray */
.bg-destructive   /* Light: red | Dark: red */

/* Text Colors - CONTEXT-BASED NAMING */
.text-foreground           /* Text on main background | Light: near-black | Dark: white */
.text-card-foreground      /* Text on card background | Light: near-black | Dark: white */
.text-popover-foreground   /* Text on popover background | Light: near-black | Dark: white */
.text-primary-foreground   /* Text on PRIMARY button/background | Light: white | Dark: white */
.text-secondary-foreground /* Text on SECONDARY button/background | Light: near-black | Dark: white */
.text-muted-foreground     /* Subdued text on main background | Light: medium-gray | Dark: light-gray */
.text-accent-foreground    /* Text on accent background | Light: near-black | Dark: white */
.text-destructive-foreground /* Text on destructive/red background | Light: white | Dark: white */

/* Border Colors */
.border-border    /* Light: light-gray | Dark: medium-gray */
.border-input     /* Light: light-gray | Dark: dark-gray */
.border-ring      /* Light: dark-gray | Dark: light-gray (focus) */
```

## Practical Usage Examples

### Upload Areas
```css
.upload-zone {
  @apply border-2 border-dashed border-border bg-muted/50 hover:bg-muted/80
         text-muted-foreground rounded-lg p-8 transition-colors;
  /* Dashed border, subtle background, muted text */
}
```

### Status Indicators
```css
.success-status {
  @apply bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300
         border border-green-200 dark:border-green-800 rounded-md px-3 py-1;
}

.error-status {
  @apply bg-destructive/10 text-destructive border border-destructive/20 rounded-md px-3 py-1;
}

.warning-status {
  @apply bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300
         border border-yellow-200 dark:border-yellow-800 rounded-md px-3 py-1;
}
```

### Navigation Elements
```css
.nav-link {
  @apply text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md;
}

.nav-link-active {
  @apply text-foreground bg-accent font-medium px-3 py-2 rounded-md;
}
```

## Accessibility Notes

### CRITICAL: Text Contrast Requirements
- **ALL TEXT MUST BE WHITE IN DARK MODE** - No exceptions for accessibility
- **Dark Mode**: Pure white text (#FFFFFF) on dark backgrounds for maximum contrast
- **Light Mode**: Near-black text (#0D0D0D) on light backgrounds for maximum contrast
- **User requires high contrast** due to Chrome accessibility filter usage

### Contrast Ratios
- **Light Mode**: Dark text (5% lightness) on white background provides ~19:1 contrast ratio
- **Dark Mode**: White text (100% lightness) on dark background (8% lightness) provides ~12:1 contrast ratio
- Both exceed WCAG AAA standards (7:1 for normal text, 4.5:1 for large text)

### Chrome Filter Compatibility
- Pure white text in dark mode works well with Chrome accessibility filters
- High contrast ratios ensure readability with various filter settings
- Neutral grays avoid color-specific accessibility issues

### Implementation Requirements
- Use `color: white !important` for all text in dark mode
- Avoid any gray text colors in dark mode
- Ensure all form inputs have white text in dark mode
- Test with Chrome accessibility filters enabled

## Quick Reference

### Most Common Patterns
```css
/* Page wrapper */
.page { @apply bg-background text-foreground min-h-screen; }

/* Content cards */
.card { @apply bg-card text-card-foreground border border-border rounded-lg; }

/* Primary action */
.btn-primary { @apply bg-primary text-primary-foreground hover:bg-primary/90; }

/* Secondary action */
.btn-secondary { @apply bg-secondary text-secondary-foreground hover:bg-secondary/80; }

/* Form field */
.input { @apply bg-input text-foreground border border-border focus:ring-2 focus:ring-ring; }

/* Helper text */
.help-text { @apply text-muted-foreground text-sm; }
```
