# dosieungon — AI Assistant Guide

This is a **React/Next.js UI component library** published as the `dosieungon` npm package.
Read this file fully before making any change to this codebase.

---

## Monorepo Context

This package lives inside the `dosieungon` bun workspace monorepo.
The `frontend` package declares `"dosieungon-ui": "workspace:*"` and resolves
imports directly to this package's `dist/` via a bun symlink — no npm publish
needed during development. See the root `CLAUDE.md` for the full workspace guide.

---

## Build & Commands

```bash
npm run build   # compile to dist/ (ESM + CJS + types)
npm run dev     # watch mode — rebuilds dist/ on every src/ save
```

Output: `dist/dosieungon.js` (ESM), `dist/dosieungon.cjs` (CJS), `dist/index.d.ts`.

Stack: **Vite 5** + `vite-plugin-dts` + `vite-plugin-css-injected-by-js`.  
CSS is **automatically injected** into a `<style>` tag when the JS bundle loads — users never import a CSS file separately.

---

## Project Structure

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx      ← component implementation
│   │   ├── Button.css      ← scoped styles (no CSS Modules)
│   │   └── index.ts        ← re-exports component + all types
│   ├── Modal/
│   ├── Select/
│   ├── Input/
│   ├── Card/
│   ├── Chip/
│   ├── Radio/
│   ├── Checkbox/
│   ├── Switch/
│   ├── Drawer/
│   └── Breadcrumb/
├── styles/
│   └── variables.css       ← ALL CSS custom properties (design tokens)
├── utils/
│   └── cn.ts               ← className utility (no external deps)
└── index.ts                ← library entry: re-exports everything
```

Every component **must** follow this 3-file pattern. Never merge them.

---

## CSS Conventions — Critical Rules

### 1. All class names are prefixed with `dsg-`

```css
/* CORRECT */
.dsg-badge { ... }
.dsg-badge--primary { ... }
.dsg-badge__label { ... }

/* WRONG — will conflict with user's CSS */
.badge { ... }
.primary { ... }
```

### 2. Naming follows BEM

- Block: `.dsg-[component]`
- Modifier: `.dsg-[component]--[modifier]`
- Element: `.dsg-[component]__[element]`

```css
.dsg-badge              /* block */
.dsg-badge--danger      /* modifier: variant */
.dsg-badge--sm          /* modifier: size */
.dsg-badge__icon        /* element */
.dsg-badge__label       /* element */
```

### 3. Always use CSS custom properties from variables.css — never hardcode colors

```css
/* CORRECT */
color: var(--dsg-text);
background: var(--dsg-primary);
border: 1.5px solid var(--dsg-border);

/* WRONG */
color: #18181b;
background: #0285F7;
```

### 4. Always import variables.css at the top of every .tsx file

```tsx
import '../../styles/variables.css';
import './ComponentName.css';
import { cn } from '../../utils/cn';
```

### 5. No CSS Modules. No styled-components. No Tailwind. No inline style objects for static values

```tsx
/* CORRECT */
<div className="dsg-badge dsg-badge--primary" />

/* WRONG */
<div style={{ color: '#0285F7' }} />
<div style={{ background: 'var(--dsg-primary)' }} />
```

Inline `style` is only acceptable for **dynamic/computed values** that cannot be expressed as a CSS class:

```tsx
/* OK — dynamic value from prop */
<div style={{ width: `${size}px` }} />
```

### 6. All CSS variables available

```
/* Colors */
--dsg-primary           #0285F7
--dsg-primary-hover     #0274D9
--dsg-primary-active    #0265C0
--dsg-primary-subtle    rgba(2,133,247,0.1)
--dsg-primary-subtle-hover rgba(2,133,247,0.15)

--dsg-danger            #ef4444
--dsg-danger-hover      #dc2626
--dsg-danger-subtle     rgba(239,68,68,0.1)

--dsg-warning           #f59e0b
--dsg-warning-hover     #d97706
--dsg-warning-subtle    rgba(245,158,11,0.1)

--dsg-success           #22c55e
--dsg-success-subtle    rgba(34,197,94,0.1)

/* Neutral */
--dsg-overlay           #18181b  (dark near-black)
--dsg-hover             #27272A  (hover bg for dark elements)
--dsg-surface           #f4f4f5  (light gray bg)
--dsg-surface-hover     #e4e4e7
--dsg-border            #e4e4e7
--dsg-border-focus      #0285F7

/* Text */
--dsg-text              #18181b
--dsg-text-secondary    #52525b
--dsg-text-muted        #71717a
--dsg-text-disabled     #a1a1aa
--dsg-text-on-primary   #ffffff

/* Backgrounds */
--dsg-bg                #ffffff  (main bg, dark: #18181b)
--dsg-bg-overlay        rgba(24,24,27,0.6)  (modal/drawer backdrop)

/* Radius */
--dsg-radius-xs         4px
--dsg-radius-sm         6px
--dsg-radius            8px    (default)
--dsg-radius-lg         12px
--dsg-radius-xl         16px
--dsg-radius-full       9999px

/* Shadows */
--dsg-shadow-sm
--dsg-shadow
--dsg-shadow-lg
--dsg-shadow-xl

/* Typography */
--dsg-font              system font stack
--dsg-font-mono         monospace stack

/* Transitions */
--dsg-transition        150ms ease
--dsg-transition-slow   250ms ease

/* Z-index */
--dsg-z-dropdown        1000
--dsg-z-modal           1100
--dsg-z-drawer          1200
```

Dark mode is handled automatically via `prefers-color-scheme` and the `[data-dsg-theme="dark"]` attribute — **do not add separate dark-mode CSS**; just use the variables above.

---

## TypeScript Conventions

### 1. Use `forwardRef` for all DOM-wrapping components

```tsx
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, className, ...props }, ref) => (
    <span ref={ref} className={cn('dsg-badge', className)} {...props}>
      {children}
    </span>
  )
);
Badge.displayName = 'Badge';
```

Use `React.FC<Props>` only for composite components that don't directly wrap a DOM element (e.g., Modal, Select, Drawer).

### 2. Extend native HTML element props

```tsx
/* CORRECT — user gets all native button props */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'filled' | 'outlined';
}

/* WRONG — user loses native props */
export interface BadgeProps {
  variant?: 'filled' | 'outlined';
  onClick?: () => void;
}
```

When the component overrides a native prop (like `size`), use `Omit`:

```tsx
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}
```

### 3. Controlled/Uncontrolled pattern

For components with state (Select, Radio.Group), support both controlled and uncontrolled:

```tsx
const isControlled = valueProp !== undefined;
const [internal, setInternal] = useState(defaultValue ?? initialValue);

const currentValue = isControlled ? valueProp : internal;

const handleChange = (val: T) => {
  if (!isControlled) setInternal(val);
  onChange?.(val);
};
```

### 4. Export all types from index.ts

```ts
// src/components/Badge/index.ts
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';
```

And add to `src/index.ts`:

```ts
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeVariant } from './components/Badge';
```

---

## Animation Pattern (Modal/Drawer)

Components that animate in/out use a double-state pattern to enable CSS transitions:

```tsx
const [mounted, setMounted] = useState(false);   // controls DOM presence
const [visible, setVisible] = useState(false);   // controls CSS transition class

useEffect(() => {
  if (open) {
    setMounted(true);
    // double rAF: wait for browser to paint the mounted element before adding transition class
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  } else {
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 260); // match CSS transition duration
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
.dsg-overlay--visible {
  opacity: 1;
}
```

**Never** use `display: none` toggling for animated components. **Never** use `React.AnimatePresence` or Framer Motion — this library uses pure CSS transitions only.

---

## Portal Pattern (Modal/Drawer)

Components that render outside the normal DOM hierarchy use `createPortal`:

```tsx
import { createPortal } from 'react-dom';

// Always guard for SSR
if (!mounted || typeof document === 'undefined') return null;

return createPortal(<div>...</div>, document.body);
```

### Scroll lock (for Modal/Drawer)

```tsx
useEffect(() => {
  if (!open) return;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollbarWidth}px`; // prevent layout shift
  return () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };
}, [open]);
```

---

## The `cn()` Utility

Located at `src/utils/cn.ts`. Zero dependencies. Filters falsy values and joins class names.

```tsx
import { cn } from '../../utils/cn';

cn('dsg-btn', 'dsg-btn--primary', false, undefined, 'extra-class')
// → 'dsg-btn dsg-btn--primary extra-class'
```

Always pass `className` from props as the **last argument** so users can override:

```tsx
<div className={cn('dsg-card', hoverable && 'dsg-card--hoverable', className)} />
```

---

## Existing Components & Their Props

### Button
```tsx
<Button
  variant="primary"    // 'primary'|'secondary'|'danger'|'warning'|'ghost'
  size="md"            // 'sm'|'md'|'lg'
  outline={false}      // transparent background with colored border
  loading={false}
  iconOnly={false}
  leftIcon={<Icon />}
  rightIcon={<Icon />}
  color="danger"       // for outline buttons: 'danger'|'warning'|'secondary'
  // + all native <button> props
/>
```

### Modal
```tsx
<Modal
  open={bool}
  onClose={() => {}}
  title="Title"
  size="md"           // 'sm'|'md'|'lg'|'xl'|'full'
  closeOnBackdrop={true}
  closeOnEscape={true}
  footer={<div>...</div>}
  hideCloseButton={false}
  className=""
  bodyClassName=""
>
  content
</Modal>
```

### Select
```tsx
<Select
  options={[
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B', disabled: true },
    { group: 'Group Name', options: [{ value: 'c', label: 'C' }] },
  ]}
  value={value}            // string|number for single, (string|number)[] for multiple
  defaultValue={...}       // uncontrolled initial value
  onChange={(val) => {}}
  multiple={false}
  searchable={false}
  placeholder="Select..."
  disabled={false}
  clearable={false}
  label="Label"
  required={false}
  error="Error message"
  hint="Helper text"
  size="md"               // 'sm'|'md'|'lg'
  emptyText="No options found"
  className=""
/>
```

### Input
```tsx
<Input
  label="Label"
  required={false}
  error="Error message"
  hint="Helper text"
  size="md"              // 'sm'|'md'|'lg'
  leftIcon={<Icon />}
  rightIcon={<Icon />}
  wrapperClassName=""
  // + all native <input> props

  // For textarea:
  multiline={true}
  rows={4}
/>
```

### Card
```tsx
<Card
  header={<div>Header</div>}
  footer={<div>Footer</div>}
  hoverable={false}
  clickable={false}   // renders as <button> when true
  shadow={false}
  bodyClassName=""
  className=""
>
  content
</Card>
```

### Chip
```tsx
<Chip
  variant="filled"   // 'filled'|'outlined'
  color="primary"    // 'primary'|'secondary'|'danger'|'warning'|'success'
  size="md"          // 'sm'|'md'|'lg'
  onClose={(e) => {}}   // shows × button
  onClick={(e) => {}}   // renders as <button> when provided
  className=""
>
  Label
</Chip>
```

### Radio
```tsx
<Radio.Group
  value={value}
  defaultValue="a"
  onChange={(val) => {}}
  direction="vertical"   // 'vertical'|'horizontal'
  size="md"              // 'sm'|'md'|'lg'
  disabled={false}
  name="group-name"
>
  <Radio value="a" label="Option A" />
  <Radio value="b" label="Option B" disabled />
</Radio.Group>
```

### Checkbox
```tsx
<Checkbox
  checked={bool}
  indeterminate={false}
  onChange={(e) => {}}
  label="Label"
  size="md"          // 'sm'|'md'|'lg'
  disabled={false}
  className=""
  // + all native <input> props except type/size
/>
```

### Switch
```tsx
<Switch
  checked={bool}
  onChange={(e) => {}}
  label="Label"
  labelPosition="right"  // 'left'|'right'
  size="md"              // 'sm'|'md'|'lg'
  disabled={false}
  className=""
  // + all native <input> props except type/size
/>
```

### Drawer
```tsx
<Drawer
  open={bool}
  onClose={() => {}}
  placement="right"      // 'left'|'right'|'top'|'bottom'
  size="md"              // 'sm'|'md'|'lg'|'full'
  title="Title"
  footer={<div>...</div>}
  hideCloseButton={false}
  closeOnBackdrop={true}
  closeOnEscape={true}
  className=""
  bodyClassName=""
>
  content
</Drawer>
```

### Breadcrumb
```tsx
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },          // renders as <a>
    { label: 'Settings', onClick: fn },    // renders as <button>
    { label: 'Profile' },                  // last item = current page (<span aria-current="page">)
  ]}
  separator="/"     // ReactNode, default "/"
  size="md"         // 'sm'|'md'|'lg'
  className=""
  // + all native <nav> props via forwardRef
/>
```

---

## How to Add a New Component

Follow these steps exactly:

**1. Create the 3 files:**

```
src/components/Badge/Badge.css
src/components/Badge/Badge.tsx
src/components/Badge/index.ts
```

**2. Badge.css — use `.dsg-badge` prefix, use CSS variables:**

```css
.dsg-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--dsg-radius-full);
  font-family: var(--dsg-font);
  font-size: 12px;
  font-weight: 500;
  /* ... */
}
.dsg-badge--primary {
  background: var(--dsg-primary-subtle);
  color: var(--dsg-primary);
}
```

**3. Badge.tsx — import order, forwardRef, cn(), className last:**

```tsx
import React, { HTMLAttributes, forwardRef } from 'react';
import '../../styles/variables.css';  // always first
import './Badge.css';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'primary' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

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

**4. index.ts:**

```ts
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';
```

**5. Add to src/index.ts:**

```ts
export { Badge } from './components/Badge';
export type { BadgeProps, BadgeVariant } from './components/Badge';
```

**6. Run `npm run build` — must complete with 0 errors.**

---

## Rules — Never Do These

- **Never** install runtime dependencies. Zero deps besides `react` and `react-dom` (peer deps).
- **Never** use Framer Motion, styled-components, emotion, clsx, tailwind-merge.
- **Never** use Tailwind CSS classes (e.g., `className="flex items-center"`).
- **Never** hardcode color hex values in CSS — always use `var(--dsg-*)`.
- **Never** use CSS Modules (`.module.css`).
- **Never** put styles inline via `style={{}}` for static values.
- **Never** omit the `className` prop on a component — it must always be accepted and passed to the root element via `cn(..., className)`.
- **Never** skip the `variables.css` import in a `.tsx` file.
- **Never** add a component to `src/components/` without also exporting it from `src/index.ts`.
- **Never** `export default` — always use named exports.
- **Never** use React 18-only APIs without a fallback for React 17 compatibility.

---

## Dark Mode

Dark mode is fully automatic via CSS custom properties. Do NOT add `dark:` class variants or JS-based theme switching. Just use `--dsg-*` variables and everything adapts.

To force dark mode: add `data-dsg-theme="dark"` to any ancestor element (e.g., `<html>`).  
To force light mode: add `data-dsg-theme="light"`.
