# FiloSign Color Palette

This document defines the color palette and design tokens used throughout the FiloSign application.

## Design Principles

- **High Contrast**: All text must have sufficient contrast for accessibility
- **Chrome Filter Compatible**: Colors work well with Chrome accessibility filters
- **System Preference Aware**: Respects user's light/dark mode preferences

## Color Variables

### Light Mode (Default)
```css
:root {
  --background: 0 0% 100%;        /* Pure white background */
  --foreground: 0 0% 5%;          /* Very dark text (near black) */
  --card: 0 0% 100%;              /* White card backgrounds */
  --card-foreground: 0 0% 5%;     /* Dark text on cards */
  --popover: 0 0% 100%;           /* White popover backgrounds */
  --popover-foreground: 0 0% 5%;  /* Dark text in popovers */
  --primary: 0 0% 10%;            /* Dark primary color */
  --primary-foreground: 0 0% 98%; /* Light text on primary */
  --secondary: 0 0% 96%;          /* Light gray secondary */
  --secondary-foreground: 0 0% 10%; /* Dark text on secondary */
  --muted: 0 0% 96%;              /* Muted background */
  --muted-foreground: 0 0% 40%;   /* Medium gray muted text */
  --accent: 0 0% 96%;             /* Light accent background */
  --accent-foreground: 0 0% 10%;  /* Dark text on accent */
  --destructive: 0 84.2% 60.2%;   /* Red for destructive actions */
  --destructive-foreground: 0 0% 98%; /* Light text on destructive */
  --border: 0 0% 90%;             /* Light gray borders */
  --input: 0 0% 90%;              /* Light gray input backgrounds */
  --ring: 0 0% 10%;               /* Dark focus rings */
}
```

### Dark Mode
```css
.dark {
  --background: 220 13% 8%;       /* Very dark blue-gray background */
  --foreground: 0 0% 100%;        /* Pure white text */
  --card: 220 13% 12%;            /* Slightly lighter card backgrounds */
  --card-foreground: 0 0% 100%;   /* White text on cards */
  --popover: 220 13% 12%;         /* Dark popover backgrounds */
  --popover-foreground: 0 0% 100%; /* White text in popovers */
  --primary: 0 0% 100%;           /* White primary color */
  --primary-foreground: 220 13% 8%; /* Dark text on primary */
  --secondary: 220 13% 15%;       /* Dark secondary background */
  --secondary-foreground: 0 0% 100%; /* White text on secondary */
  --muted: 220 13% 15%;           /* Muted dark background */
  --muted-foreground: 0 0% 85%;   /* Light gray muted text */
  --accent: 220 13% 15%;          /* Dark accent background */
  --accent-foreground: 0 0% 100%; /* White text on accent */
  --destructive: 0 62.8% 50%;     /* Red for destructive actions */
  --destructive-foreground: 0 0% 100%; /* White text on destructive */
  --border: 220 13% 20%;          /* Dark borders */
  --input: 220 13% 15%;           /* Dark input backgrounds */
  --ring: 0 0% 90%;               /* Light focus rings */
}
```

## Accessibility Notes

### Contrast Ratios
- **Light Mode**: Dark text (5% lightness) on white background provides ~19:1 contrast ratio
- **Dark Mode**: White text (100% lightness) on dark background (8% lightness) provides ~12:1 contrast ratio
- Both exceed WCAG AAA standards (7:1 for normal text, 4.5:1 for large text)

### Chrome Filter Compatibility
- Pure white text in dark mode works well with Chrome accessibility filters
- High contrast ratios ensure readability with various filter settings
- Neutral grays avoid color-specific accessibility issues

## Usage Guidelines

### Text Colors
- Use `text-foreground` for primary text
- Use `text-muted-foreground` for secondary/helper text
- Use `text-primary-foreground` for text on primary backgrounds

### Background Colors
- Use `bg-background` for main page backgrounds
- Use `bg-card` for content cards and panels
- Use `bg-secondary` for subtle background variations

### Interactive Elements
- Use `bg-primary` with `text-primary-foreground` for primary buttons
- Use `bg-secondary` with `text-secondary-foreground` for secondary buttons
- Use `border-border` for consistent border styling

## Future Considerations

- Consider adding brand colors while maintaining accessibility
- Evaluate color-blind friendly palette additions
- Test with various Chrome accessibility filters
- Consider user-customizable contrast levels
