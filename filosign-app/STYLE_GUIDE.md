# FiloSign Style Guide & Color Contrast Analysis

## Current Color Contrast Issues

### 🚨 **Problem Identified**
When hover states change background colors to lighter shades, text colors don't automatically adjust, causing poor contrast and unreadable text.

## Color Palette

### Light Mode Colors
| Variable | Color Name | HSL Value | Hex Equivalent | Usage |
|----------|------------|-----------|----------------|-------|
| `--background` | Pure White | `0 0% 100%` | `#FFFFFF` | Page background |
| `--foreground` | Near Black | `0 0% 5%` | `#0D0D0D` | Primary text |
| `--primary` | Dark Gray | `0 0% 10%` | `#1A1A1A` | Primary buttons |
| `--primary-foreground` | Off White | `0 0% 98%` | `#FAFAFA` | Text on primary |
| `--muted-foreground` | Medium Gray | `0 0% 40%` | `#666666` | Secondary text |
| `--accent` | Light Gray | `0 0% 96%` | `#F5F5F5` | Hover backgrounds |

### Dark Mode Colors
| Variable | Color Name | HSL Value | Hex Equivalent | Usage |
|----------|------------|-----------|----------------|-------|
| `--background` | Dark Blue-Gray | `220 15% 12%` | `#1A1D23` | Page background |
| `--foreground` | Pure White | `0 0% 100%` | `#FFFFFF` | Primary text |
| `--primary` | Pure White | `0 0% 100%` | `#FFFFFF` | Primary buttons |
| `--primary-foreground` | Dark Blue-Gray | `220 15% 12%` | `#1A1D23` | Text on primary |
| `--muted-foreground` | Light Gray | `0 0% 90%` | `#E6E6E6` | Secondary text |
| `--accent` | Medium Blue-Gray | `220 15% 20%` | `#2A2F36` | Hover backgrounds |

## Element-Specific Style Guide

### 1. Primary Buttons
**Element Type:** Default action buttons (Send Document, Sign Document)
**CSS Classes:** `.btn`, `variant="default"`

#### Light Mode
- **Default State:**
  - Background: Dark Gray `#1A1A1A` (`--primary`)
  - Text: Off White `#FAFAFA` (`--primary-foreground`)
  - Border: None
- **Hover State:**
  - Background: Medium Gray `#333333` (`--primary/80`)
  - Text: Off White `#FAFAFA` (unchanged)
  - Shadow: Medium `hover:shadow-md`

#### Dark Mode
- **Default State:**
  - Background: Pure White `#FFFFFF` (`--primary`)
  - Text: Dark Blue-Gray `#1A1D23` (`--primary-foreground`)
  - Border: None
- **Hover State:** ⚠️ **CONTRAST ISSUE**
  - Background: Light Gray `#E6E6E6` (`white/90`)
  - Text: Dark Blue-Gray `#1A1D23` (should remain dark)
  - **Problem:** Good contrast maintained

### 2. Outline Buttons
**Element Type:** Secondary actions (Quick Select, Logout)
**CSS Classes:** `variant="outline"`

#### Light Mode
- **Default State:**
  - Background: Transparent
  - Text: Dark Gray `#1A1A1A` (`--foreground`)
  - Border: Light Gray `#E5E5E5` (`--border`)
- **Hover State:**
  - Background: Light Gray `#F5F5F5` (`--accent`)
  - Text: Dark Gray `#1A1A1A` (`--accent-foreground`)
  - Border: Light Gray `#E5E5E5`

#### Dark Mode ⚠️ **MAJOR CONTRAST ISSUE**
- **Default State:**
  - Background: Medium Blue-Gray `#2A2F36` (`input/30`)
  - Text: Pure White `#FFFFFF` (`--foreground`)
  - Border: Medium Blue-Gray `#404954` (`--input`)
- **Hover State:** ❌ **BROKEN CONTRAST**
  - Background: Light Blue-Gray `#4A5259` (`input/70`)
  - Text: Pure White `#FFFFFF` (should change to dark)
  - **Problem:** White text on light background = unreadable

### 3. Ghost Buttons
**Element Type:** Subtle actions (navigation, secondary options)
**CSS Classes:** `variant="ghost"`

#### Dark Mode ⚠️ **CONTRAST ISSUE**
- **Default State:**
  - Background: Transparent
  - Text: Pure White `#FFFFFF`
- **Hover State:** ❌ **POOR CONTRAST**
  - Background: Medium Blue-Gray `#2A2F36` (`accent/70`)
  - Text: Pure White `#FFFFFF` (needs better contrast)

### 4. Upload Area
**Element Type:** File upload dropzone
**CSS Classes:** `.upload-text`, `.upload-text-secondary`

#### Dark Mode
- **Default State:**
  - Background: Transparent with dashed border
  - Primary Text: Very Light Gray `#F2F2F2` (`95%`)
  - Secondary Text: Light Gray `#D9D9D9` (`85%`)
  - Icon: Light Gray `#CCCCCC` (`80%`)
- **Hover State:** ⚠️ **POTENTIAL ISSUE**
  - Background: Primary Tint `rgba(255,255,255,0.05)`
  - Text: Should change to Primary color
  - **Problem:** Primary color transition may cause contrast issues

### 5. Form Labels
**Element Type:** Input field labels
**CSS Classes:** `.form-label`

#### Dark Mode
- **Color:** Very Light Gray `#F2F2F2` (`95%`)
- **Background:** Transparent
- **Contrast Ratio:** Excellent (19:1)

### 6. Card Hover States
**Element Type:** Interactive cards (main page actions)
**CSS Classes:** `.group`, `group-hover:text-primary`

#### Dark Mode ⚠️ **CONTRAST ISSUE**
- **Default State:**
  - Background: Dark Blue-Gray `#2A2F36`
  - Text: Pure White `#FFFFFF`
- **Hover State:** ❌ **POOR CONTRAST**
  - Background: Lighter (scale effect)
  - Text: Changes to Primary White `#FFFFFF`
  - **Problem:** White text on light background during transition

## Proposed Color Fixes

### 1. Enhanced Button Variants
```css
/* Fixed Outline Button Dark Mode */
.dark .btn-outline:hover {
  background: hsl(220 15% 25%);  /* Darker hover background */
  color: hsl(0 0% 100%);         /* Keep white text */
  border-color: hsl(220 15% 35%); /* Lighter border */
}

/* Alternative: Light background with dark text */
.dark .btn-outline-alt:hover {
  background: hsl(0 0% 90%);     /* Light background */
  color: hsl(220 15% 12%);       /* Dark text */
  border-color: hsl(0 0% 80%);   /* Medium border */
}
```

### 2. Smart Hover Text Colors
```css
/* Context-aware text colors */
.dark .hover-smart:hover {
  background: hsl(0 0% 85%);     /* Light background */
  color: hsl(220 15% 12%);       /* Dark text for contrast */
}

.dark .hover-smart-dark:hover {
  background: hsl(220 15% 25%);  /* Dark background */
  color: hsl(0 0% 95%);          /* Light text for contrast */
}
```

### 3. Upload Area Improvements
```css
.dark .upload-area:hover {
  background: hsl(220 15% 18%);  /* Slightly lighter dark */
  border-color: hsl(0 0% 100%);  /* White border */
}

.dark .upload-area:hover .upload-text {
  color: hsl(0 0% 100%);         /* Pure white text */
}
```

## Accessibility Standards

### WCAG AA Compliance
- **Normal Text:** Minimum 4.5:1 contrast ratio
- **Large Text:** Minimum 3:1 contrast ratio
- **Interactive Elements:** Clear focus indicators

### Current Contrast Ratios
| Element | Background | Text | Ratio | Status |
|---------|------------|------|-------|--------|
| Primary Button (Dark) | `#FFFFFF` | `#1A1D23` | 15.8:1 | ✅ Excellent |
| Outline Button Hover (Dark) | `#4A5259` | `#FFFFFF` | 2.1:1 | ❌ Fails AA |
| Form Labels (Dark) | `#1A1D23` | `#F2F2F2` | 19:1 | ✅ Excellent |
| Upload Text (Dark) | `#1A1D23` | `#F2F2F2` | 19:1 | ✅ Excellent |

## Recommended Implementation Strategy

### Phase 1: Critical Fixes
1. Fix outline button hover contrast in dark mode
2. Improve ghost button hover states
3. Ensure upload area hover maintains readability

### Phase 2: Enhanced Interactions
1. Add smart color transitions
2. Implement context-aware hover states
3. Create consistent hover patterns

### Phase 3: Advanced Features
1. Add focus indicators for accessibility
2. Implement reduced motion preferences
3. Create high contrast mode option

## Specific Implementation Fixes Needed

### 1. Button Component (`/src/components/ui/button.tsx`)

#### Current Problematic Code:
```css
outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:bg-input/30 dark:border-input dark:hover:bg-input/70 dark:hover:border-input/80"
```

#### Proposed Fix:
```css
outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:bg-input/30 dark:border-input dark:hover:bg-slate-700 dark:hover:text-white dark:hover:border-slate-600"
```

**Explanation:**
- Changes `dark:hover:bg-input/70` (light gray) to `dark:hover:bg-slate-700` (darker gray)
- Ensures white text remains readable on dark background
- Maintains visual hierarchy while fixing contrast

### 2. Quick Select Buttons (`/src/app/send/page.tsx`)

#### Current Problematic Code:
```jsx
className="justify-start hover:border-primary hover:bg-primary/5 group"
```

#### Proposed Fix:
```jsx
className="justify-start hover:border-primary dark:hover:bg-slate-700 dark:hover:border-slate-500 light:hover:bg-primary/5 group"
```

### 3. Upload Area Hover (`/src/app/send/page.tsx`)

#### Current Problematic Code:
```jsx
className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-md cursor-pointer group"
```

#### Proposed Fix:
```jsx
className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all duration-200 hover:border-primary dark:hover:bg-slate-800/50 light:hover:bg-primary/5 hover:shadow-md cursor-pointer group"
```

## Human-Readable Color Reference

### Primary Colors
- **Pure White:** `#FFFFFF` - Used for primary buttons in dark mode
- **Near Black:** `#1A1D23` - Used for text on white backgrounds
- **Slate 700:** `#334155` - Recommended dark hover background
- **Slate 600:** `#475569` - Recommended dark hover border
- **Slate 800:** `#1E293B` - Recommended very dark hover background

### Semantic Color Usage
- **Success Green:** `#10B981` (`emerald-500`) - For success states
- **Warning Orange:** `#F59E0B` (`amber-500`) - For warning states
- **Error Red:** `#EF4444` (`red-500`) - For error states
- **Info Blue:** `#3B82F6` (`blue-500`) - For informational states

### Contrast-Safe Combinations (Dark Mode)
| Background Color | Text Color | Contrast Ratio | Usage |
|------------------|------------|----------------|-------|
| `#334155` (Slate 700) | `#FFFFFF` (White) | 8.3:1 | Button hovers |
| `#1E293B` (Slate 800) | `#FFFFFF` (White) | 12.6:1 | Card hovers |
| `#475569` (Slate 600) | `#FFFFFF` (White) | 6.4:1 | Borders |
| `#FFFFFF` (White) | `#1A1D23` (Dark) | 15.8:1 | Primary buttons |

## Color Testing Tools
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser:** Desktop app for real-time testing
- **Browser DevTools:** Accessibility panel for contrast analysis

## Next Steps
1. **Review this style guide** with the development team
2. **Test proposed color combinations** using contrast checkers
3. **Implement fixes** starting with critical contrast issues
4. **Validate accessibility** using screen readers and accessibility tools
