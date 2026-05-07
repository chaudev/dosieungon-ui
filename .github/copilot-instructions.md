# dosieungon UI Library — Copilot Instructions

This is a **React/Next.js UI component library** (`dosieungon` on npm).
Follow every rule below exactly. Wrong output will break the library.

---

## Stack

- **Build:** Vite 5 + `vite-plugin-css-injected-by-js` + `vite-plugin-dts`
- **Language:** TypeScript (strict)
- **CSS:** Plain `.css` files — NO CSS Modules, NO styled-components, NO Tailwind, NO emotion
- **Runtime deps:** NONE (react/react-dom are peer deps only)
- CSS is injected automatically at bundle load — users never import a CSS file

---

## File Structure Per Component

Every component lives in `src/components/ComponentName/` with exactly 3 files:

```
ComponentName.tsx    ← React component
ComponentName.css    ← styles (plain CSS)
index.ts             ← named re-exports only
```

---

## CSS Rules

### Class naming: BEM with mandatory `dsg-` prefix

```css
.dsg-badge            /* block */
.dsg-badge--primary   /* modifier */
.dsg-badge--sm        /* modifier */
.dsg-badge__icon      /* element */
```

No exceptions. Never write `.badge`, `.primary`, `.icon`, or any unprefixed class.

### Use CSS custom properties for everything visual

Never hardcode colors, radii, shadows, fonts, or transitions. Use the tokens below.

```css
/* CORRECT */
color: var(--dsg-text);
background: var(--dsg-primary);
border-radius: var(--dsg-radius);
transition: color var(--dsg-transition);

/* WRONG */
color: #18181b;
background: #0285F7;
border-radius: 8px;
transition: color 150ms ease;
```

### Complete token list

```
/* Colors — Brand */
--dsg-primary            #0285F7
--dsg-primary-hover      #0274D9
--dsg-primary-active     #0265C0
--dsg-primary-subtle     rgba(2,133,247,0.1)
--dsg-primary-subtle-hover rgba(2,133,247,0.15)

/* Colors — Semantic */
--dsg-danger             #ef4444
--dsg-danger-hover       #dc2626
--dsg-danger-subtle      rgba(239,68,68,0.1)
--dsg-warning            #f59e0b
--dsg-warning-hover      #d97706
--dsg-warning-subtle     rgba(245,158,11,0.1)
--dsg-success            #22c55e
--dsg-success-subtle     rgba(34,197,94,0.1)

/* Colors — Neutral */
--dsg-overlay            #18181b
--dsg-hover              #27272A
--dsg-surface            #f4f4f5
--dsg-surface-hover      #e4e4e7
--dsg-border             #e4e4e7
--dsg-border-focus       #0285F7

/* Colors — Text */
--dsg-text               #18181b
--dsg-text-secondary     #52525b
--dsg-text-muted         #71717a
--dsg-text-disabled      #a1a1aa
--dsg-text-on-primary    #ffffff

/* Colors — Background */
--dsg-bg                 #ffffff  (dark mode: #18181b)
--dsg-bg-overlay         rgba(24,24,27,0.6)

/* Radius */
--dsg-radius-xs     4px
--dsg-radius-sm     6px
--dsg-radius        8px
--dsg-radius-lg     12px
--dsg-radius-xl     16px
--dsg-radius-full   9999px

/* Shadow */
--dsg-shadow-sm
--dsg-shadow
--dsg-shadow-lg
--dsg-shadow-xl

/* Typography */
--dsg-font          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...
--dsg-font-mono     monospace stack

/* Transitions */
--dsg-transition        150ms ease
--dsg-transition-slow   250ms ease

/* Z-index */
--dsg-z-dropdown    1000
--dsg-z-modal       1100
--dsg-z-drawer      1200
```

### Dark mode

Do NOT write separate dark-mode CSS. The tokens above already adapt automatically via `prefers-color-scheme` and `[data-dsg-theme="dark"]`. Just use `var(--dsg-*)`.

---

## TypeScript Rules

### Import order in every .tsx file

```tsx
import React, { ... } from 'react';
import '../../styles/variables.css';   // ← always import this first
import './ComponentName.css';
import { cn } from '../../utils/cn';
```

### `cn()` — className utility

```ts
import { cn } from '../../utils/cn';

cn('dsg-btn', 'dsg-btn--primary', false, undefined, className)
// → 'dsg-btn dsg-btn--primary [className]'
```

Rules:
- **Always** pass user's `className` as the last argument
- **Never** use template literals to build class strings

### `forwardRef` — required for DOM-element wrappers

```tsx
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('dsg-badge', `dsg-badge--${variant}`, className)}
      {...props}
    >
      {children}
    </span>
  )
);
Badge.displayName = 'Badge';
```

Use `React.FC<Props>` only for composite/headless components (Modal, Select, Drawer).

### Props interface

```tsx
/* Always extend the matching HTML element's attributes */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'danger';
}

/* When overriding a native prop, use Omit */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}
```

### Named exports only

```ts
// CORRECT
export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

// WRONG
export default Badge;
```

### Register in src/index.ts

```ts
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeVariant } from './components/Badge';
```

---

## Controlled / Uncontrolled Pattern

For stateful components (inputs, selects, checkboxes), support both:

```tsx
const isControlled = valueProp !== undefined;
const [internal, setInternal] = useState(defaultValue ?? fallback);

const current = isControlled ? valueProp : internal;

const handleChange = (val: T) => {
  if (!isControlled) setInternal(val);
  onChange?.(val);
};
```

---

## Open/Close Animation Pattern

For overlays (Modal, Drawer, dropdown), use the double-state approach:

```tsx
const [mounted, setMounted] = useState(false);
const [visible, setVisible] = useState(false);

useEffect(() => {
  if (open) {
    setMounted(true);
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true))
    );
    return () => cancelAnimationFrame(id);
  } else {
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 260);
    return () => clearTimeout(t);
  }
}, [open]);

if (!mounted) return null;
```

CSS:
```css
.dsg-overlay {
  opacity: 0;
  transition: opacity var(--dsg-transition-slow);
}
.dsg-overlay--visible { opacity: 1; }
```

Never use `display: none` toggling. Never use Framer Motion.

---

## Portal Pattern (Modal / Drawer)

```tsx
import { createPortal } from 'react-dom';

// Guard for SSR
if (!mounted || typeof document === 'undefined') return null;

return createPortal(<div className="dsg-modal-overlay">...</div>, document.body);
```

### Scroll lock with scrollbar-width compensation

```tsx
useEffect(() => {
  if (!open) return;
  const w = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${w}px`;
  return () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };
}, [open]);
```

---

## Absolute Prohibitions

| What | Why |
|------|-----|
| Installing any runtime npm package | Zero deps is a hard requirement |
| CSS Modules (`.module.css`) | This project uses plain `.css` + `dsg-` prefix |
| Tailwind CSS classes | No Tailwind in this repo |
| `style={{ color: '#...' }}` for static values | Use CSS classes instead |
| Hardcoded hex/rgb/hsl values in CSS | Use `var(--dsg-*)` tokens |
| Unprefixed CSS class names | Everything must start with `dsg-` |
| `export default` | Named exports only |
| Framer Motion / any animation library | Pure CSS transitions only |
| Forgetting to import `variables.css` | Tokens won't resolve |
| Forgetting to add new component to `src/index.ts` | It won't be in the package |
| React 18-only APIs without fallback | Must support React 17+ |

---

## Existing Component APIs (quick reference)

```tsx
// Button
<Button variant="primary|secondary|danger|warning|outline|ghost"
        size="sm|md|lg" loading iconOnly
        leftIcon={} rightIcon={} color="danger|warning|secondary"
        {/* all native button props */} />

// Modal
<Modal open onClose title size="sm|md|lg|xl|full"
       closeOnBackdrop closeOnEscape footer hideCloseButton
       className bodyClassName />

// Select
<Select options={[{value,label,disabled?}|{group,options:[]}]}
        value defaultValue onChange
        multiple searchable clearable
        placeholder label required error hint
        size="sm|md|lg" emptyText className />

// Input
<Input label required error hint size="sm|md|lg"
       leftIcon rightIcon wrapperClassName
       multiline rows  {/* all native input/textarea props */} />

// Card
<Card header footer hoverable clickable shadow
      bodyClassName className />

// Chip
<Chip variant="filled|outlined"
      color="primary|secondary|danger|warning|success"
      size="sm|md|lg" onClose onClick className />

// Radio.Group + Radio
<Radio.Group value defaultValue onChange
             direction="vertical|horizontal" size="sm|md|lg"
             disabled name>
  <Radio value label disabled />
</Radio.Group>

// Checkbox
<Checkbox checked indeterminate onChange
          label size="sm|md|lg" disabled className />

// Switch
<Switch checked onChange label labelPosition="left|right"
        size="sm|md|lg" disabled className />

// Drawer
<Drawer open onClose placement="left|right|top|bottom"
        size="sm|md|lg|full" title footer
        hideCloseButton closeOnBackdrop closeOnEscape
        className bodyClassName />
```
