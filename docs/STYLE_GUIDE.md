# Style Guide - Split Money

**Last Updated**: 2024-12-06  
**Version**: 1.3.3

---

## 📋 Table of Contents

1. [Design Tokens](#design-tokens)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Layout & Grid](#layout--grid)
7. [Responsive Design](#responsive-design)
8. [Animations & Transitions](#animations--transitions)
9. [Accessibility](#accessibility)
10. [Best Practices](#best-practices)

---

## 🎨 Design Tokens

All design tokens are centralized in `src/theme/designTokens.ts` for consistency across the application.

### Usage

```typescript
import { designTokens } from '@/theme/designTokens';

// Use tokens in components
const styles = {
  padding: designTokens.spacing.md,
  color: designTokens.colors.primary.main,
  fontSize: designTokens.typography.fontSize.lg,
};
```

---

## 🎨 Color Palette

### Primary Colors

- **Primary Main**: `#667eea` - Primary actions, links, highlights
- **Primary Light**: `#8fa3f0` - Hover states, lighter variants
- **Primary Dark**: `#4a5fc7` - Active states, pressed buttons
- **Primary Contrast**: `#ffffff` - Text on primary backgrounds

### Secondary Colors

- **Secondary Main**: `#764ba2` - Secondary actions, accents
- **Secondary Light**: `#9a6fc0` - Hover states
- **Secondary Dark**: `#5a3480` - Active states

### Semantic Colors

#### Success
- **Main**: `#10b981` - Success messages, positive actions
- **Light**: `#34d399` - Light variants
- **Dark**: `#059669` - Dark variants

#### Error
- **Main**: `#ef4444` - Error messages, destructive actions
- **Light**: `#f87171` - Light variants
- **Dark**: `#dc2626` - Dark variants

#### Warning
- **Main**: `#f59e0b` - Warning messages, caution states
- **Light**: `#fbbf24` - Light variants
- **Dark**: `#d97706` - Dark variants

#### Info
- **Main**: `#3b82f6` - Informational messages
- **Light**: `#60a5fa` - Light variants
- **Dark**: `#2563eb` - Dark variants

### Usage Guidelines

- Use primary colors for main actions and navigation
- Use semantic colors appropriately (success for positive, error for negative)
- Ensure sufficient contrast ratios (WCAG AA minimum)
- Test colors in both light and dark themes

---

## 📝 Typography

### Font Family

- **Primary**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace**: `"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace`

### Font Sizes

| Token | Size | Usage |
|-------|------|-------|
| `xs` | 0.75rem (12px) | Small labels, captions |
| `sm` | 0.875rem (14px) | Body text, secondary text |
| `base` | 1rem (16px) | Default body text |
| `lg` | 1.125rem (18px) | Large body text |
| `xl` | 1.25rem (20px) | Subheadings |
| `2xl` | 1.5rem (24px) | Headings |
| `3xl` | 1.875rem (30px) | Large headings |
| `4xl` | 2.25rem (36px) | Display headings |

### Font Weights

- **Light**: 300 - Light text
- **Normal**: 400 - Body text, default
- **Medium**: 500 - Emphasis
- **Semibold**: 600 - Headings, strong emphasis
- **Bold**: 700 - Strong headings

### Line Heights

- **Tight**: 1.25 - Headings
- **Normal**: 1.5 - Body text, default
- **Relaxed**: 1.75 - Large text blocks

### Usage Examples

```typescript
// Headings
<Typography variant="h1" sx={{ fontSize: designTokens.typography.fontSize['4xl'] }}>
  Main Heading
</Typography>

// Body text
<Typography variant="body1" sx={{ fontSize: designTokens.typography.fontSize.base }}>
  Body text content
</Typography>
```

---

## 📏 Spacing

### Spacing Scale

| Token | Size | Usage |
|-------|------|-------|
| `xs` | 0.25rem (4px) | Tight spacing, icon padding |
| `sm` | 0.5rem (8px) | Small gaps, compact layouts |
| `md` | 1rem (16px) | Default spacing, standard gaps |
| `lg` | 1.5rem (24px) | Large gaps, section spacing |
| `xl` | 2rem (32px) | Extra large gaps, major sections |
| `2xl` | 3rem (48px) | Page sections |
| `3xl` | 4rem (64px) | Major page divisions |

### Usage Guidelines

- Use consistent spacing throughout the application
- Prefer spacing tokens over arbitrary values
- Use larger spacing for major sections
- Use smaller spacing for related elements

---

## 🧩 Components

### Material UI Components

The application uses Material UI (MUI) components as the foundation. All components follow MUI's design system with custom theming.

#### Common Components

- **Buttons**: Use `Button` component with variants (contained, outlined, text)
- **Cards**: Use `Card` and `CardContent` for content containers
- **Dialogs**: Use `Dialog` for modals and overlays
- **Forms**: Use `TextField`, `Select`, `Checkbox`, `Radio` for form inputs
- **Navigation**: Use `AppBar`, `Tabs`, `Drawer` for navigation
- **Feedback**: Use `Alert`, `Snackbar`, `CircularProgress` for user feedback

### Custom Components

#### EmptyState
Displays when there's no data to show.

```typescript
<EmptyState
  title="No expenses"
  description="Add your first expense to get started"
  actionLabel="Add Expense"
  onAction={() => handleAddExpense()}
/>
```

#### LoadingSpinner
Shows loading state.

```typescript
<LoadingSpinner message="Loading expenses..." />
```

#### ErrorState
Displays error messages.

```typescript
<ErrorState
  message="Failed to load expenses"
  onRetry={() => handleRetry()}
/>
```

---

## 📐 Layout & Grid

### Grid System

The application uses Material UI's Grid system with responsive breakpoints:

- **xs**: 0px+ (Extra small devices)
- **sm**: 600px+ (Small devices)
- **md**: 900px+ (Medium devices)
- **lg**: 1200px+ (Large devices)
- **xl**: 1536px+ (Extra large devices)

### Container Max Widths

- **xs**: Full width
- **sm**: 600px
- **md**: 900px
- **lg**: 1200px
- **xl**: 1536px

### Usage Example

```typescript
<Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 6 }}>
    {/* Content */}
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    {/* Content */}
  </Grid>
</Grid>
```

---

## 📱 Responsive Design

### Breakpoints

| Breakpoint | Width | Device Type |
|------------|-------|-------------|
| xs | 0px - 599px | Mobile (portrait) |
| sm | 600px - 899px | Mobile (landscape) |
| md | 900px - 1199px | Tablet |
| lg | 1200px - 1535px | Desktop |
| xl | 1536px+ | Large Desktop |

### Responsive Guidelines

1. **Mobile First**: Design for mobile first, then enhance for larger screens
2. **Touch Targets**: Minimum 44x44px for touch targets
3. **Readable Text**: Minimum 16px font size for body text
4. **Spacing**: Adjust spacing for smaller screens
5. **Navigation**: Use drawer navigation on mobile, horizontal on desktop

### Testing

Test on multiple viewports:
- Mobile: 320px, 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

---

## ✨ Animations & Transitions

### Transition Durations

| Token | Duration | Usage |
|-------|----------|-------|
| `shortest` | 150ms | Quick interactions |
| `shorter` | 200ms | Fast transitions |
| `short` | 250ms | Standard transitions |
| `standard` | 300ms | Default transitions |
| `complex` | 375ms | Complex animations |
| `enteringScreen` | 225ms | Page transitions in |
| `leavingScreen` | 195ms | Page transitions out |

### Easing Functions

- **easeInOut**: `cubic-bezier(0.4, 0, 0.2, 1)` - Default easing
- **easeOut**: `cubic-bezier(0.0, 0, 0.2, 1)` - Entering animations
- **easeIn**: `cubic-bezier(0.4, 0, 1, 1)` - Leaving animations
- **sharp**: `cubic-bezier(0.4, 0, 0.6, 1)` - Sharp transitions

### Usage

```typescript
const styles = {
  transition: `all ${designTokens.transitions.duration.standard}ms ${designTokens.transitions.easing.easeInOut}`,
};
```

---

## ♿ Accessibility

### Color Contrast

- Ensure WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Test colors in both light and dark themes
- Don't rely solely on color to convey information

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use proper focus indicators
- Implement logical tab order

### Screen Readers

- Use semantic HTML elements
- Provide ARIA labels where needed
- Ensure proper heading hierarchy

### Best Practices

1. Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
2. Provide alt text for images
3. Use proper form labels
4. Ensure focus indicators are visible
5. Test with keyboard navigation

---

## ✅ Best Practices

### Component Design

1. **Composition**: Build complex components from simple ones
2. **Reusability**: Create reusable components
3. **Props**: Use TypeScript for prop types
4. **State**: Keep state as local as possible
5. **Performance**: Use React.memo for expensive components

### Code Style

1. **Consistent Naming**: Use clear, descriptive names
2. **File Organization**: Group related files together
3. **Comments**: Document complex logic
4. **Type Safety**: Use TypeScript strictly

### Theming

1. **Use Design Tokens**: Always use design tokens, not hardcoded values
2. **Theme Consistency**: Use theme colors, not custom colors
3. **Dark Mode**: Ensure components work in both themes

### Performance

1. **Code Splitting**: Use React.lazy for route-based splitting
2. **Memoization**: Memoize expensive calculations
3. **Virtualization**: Use virtualization for long lists
4. **Image Optimization**: Optimize images before use

---

## 📚 Resources

- [Material UI Documentation](https://mui.com/)
- [Design Tokens File](../src/theme/designTokens.ts)
- [Theme Configuration](../src/theme/theme.ts)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Note**: This style guide is a living document and will be updated as the design system evolves.
