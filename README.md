# dosieungon

Lightweight, beautiful React UI component library. Install and use — no extra config needed.

```bash
npm install dosieungon
```

- Zero runtime dependencies
- CSS auto-injected — no import needed
- TypeScript ready (full type support)
- Dark mode built-in (auto via `prefers-color-scheme`)
- Works with React 17+, Next.js (App Router & Pages Router)

---

## Quick Start

```tsx
import { Button, Modal, Select } from 'dosieungon';

export default function App() {
  return <Button>Click me</Button>;
}
```

That's it. No CSS import. No provider wrapper.

---

## Table of Contents

- [Button](#button)
- [Input](#input)
- [Select](#select)
- [Checkbox](#checkbox)
- [Radio](#radio)
- [Switch](#switch)
- [Modal](#modal)
- [Drawer](#drawer)
- [Card](#card)
- [Chip](#chip)
- [Customization](#customization)
- [Dark Mode](#dark-mode)

---

## Button

```tsx
import { Button } from 'dosieungon';
```

### Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="warning">Warning</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Outline with color

```tsx
<Button variant="outline" color="danger">Delete</Button>
<Button variant="outline" color="warning">Warning</Button>
<Button variant="outline" color="secondary">Cancel</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>  {/* default */}
<Button size="lg">Large</Button>
```

### Loading

```tsx
<Button loading>Saving...</Button>
<Button variant="danger" loading>Deleting</Button>
```

### With icons

```tsx
import { Button } from 'dosieungon';

// Left icon
<Button leftIcon={<SearchIcon />}>Search</Button>

// Right icon
<Button rightIcon={<ArrowIcon />}>Next</Button>

// Icon only (square button)
<Button iconOnly leftIcon={<PlusIcon />} aria-label="Add" />
```

### All Button props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'warning' \| 'outline' \| 'ghost'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `loading` | `boolean` | `false` | Show spinner, disable interaction |
| `iconOnly` | `boolean` | `false` | Square button, hides text |
| `leftIcon` | `ReactNode` | — | Icon before label |
| `rightIcon` | `ReactNode` | — | Icon after label |
| `color` | `'danger' \| 'warning' \| 'secondary'` | — | Color for `outline` variant |
| `className` | `string` | — | Extra CSS class |
| `...` | `ButtonHTMLAttributes` | — | All native `<button>` props |

---

## Input

```tsx
import { Input } from 'dosieungon';
```

### Basic

```tsx
<Input placeholder="Enter your name" />
```

### With label and helper text

```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  hint="We'll never share your email."
/>
```

### Error state

```tsx
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters."
/>
```

### Required field

```tsx
<Input label="Full Name" required placeholder="John Doe" />
```

### With icons

```tsx
<Input
  leftIcon={<SearchIcon />}
  placeholder="Search..."
/>

<Input
  rightIcon={<LockIcon />}
  type="password"
  placeholder="Password"
/>
```

### Sizes

```tsx
<Input size="sm" placeholder="Small" />
<Input size="md" placeholder="Medium" />   {/* default */}
<Input size="lg" placeholder="Large" />
```

### Textarea

```tsx
<Input
  multiline
  rows={4}
  label="Message"
  placeholder="Write something..."
/>
```

### Controlled

```tsx
const [value, setValue] = useState('');

<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  label="Username"
/>
```

### All Input props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label above input |
| `required` | `boolean` | `false` | Adds `*` to label |
| `error` | `string` | — | Error message (red border + text) |
| `hint` | `string` | — | Helper text below input |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `leftIcon` | `ReactNode` | — | Icon on the left |
| `rightIcon` | `ReactNode` | — | Icon on the right |
| `multiline` | `true` | — | Render as `<textarea>` |
| `rows` | `number` | — | Rows (textarea only) |
| `wrapperClassName` | `string` | — | Class on the input wrapper div |
| `className` | `string` | — | Class on the root element |
| `...` | `InputHTMLAttributes` | — | All native `<input>` props |

---

## Select

Custom dropdown — single select, multi-select, search, option groups.

```tsx
import { Select } from 'dosieungon';
```

### Basic

```tsx
const [value, setValue] = useState('');

<Select
  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
  ]}
  value={value}
  onChange={(val) => setValue(val as string)}
  placeholder="Choose a framework"
/>
```

### With label and error

```tsx
<Select
  label="Country"
  required
  options={countries}
  value={country}
  onChange={(val) => setCountry(val as string)}
  error={!country ? 'Please select a country.' : undefined}
  placeholder="Select country"
/>
```

### Searchable

```tsx
<Select
  options={largeList}
  searchable
  placeholder="Search and select..."
/>
```

### Clearable

```tsx
<Select
  options={options}
  value={value}
  onChange={setValue}
  clearable
/>
```

### Multi-select

```tsx
const [tags, setTags] = useState<string[]>([]);

<Select
  options={[
    { value: 'js', label: 'JavaScript' },
    { value: 'ts', label: 'TypeScript' },
    { value: 'py', label: 'Python' },
  ]}
  value={tags}
  onChange={(val) => setTags(val as string[])}
  multiple
  searchable
  clearable
  placeholder="Select languages"
/>
```

### Option groups

```tsx
<Select
  options={[
    {
      group: 'Frontend',
      options: [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
      ],
    },
    {
      group: 'Backend',
      options: [
        { value: 'node', label: 'Node.js' },
        { value: 'go', label: 'Go' },
      ],
    },
  ]}
  placeholder="Select tech"
/>
```

### Disabled options

```tsx
<Select
  options={[
    { value: 'free', label: 'Free Plan' },
    { value: 'pro', label: 'Pro Plan' },
    { value: 'enterprise', label: 'Enterprise', disabled: true },
  ]}
/>
```

### Uncontrolled

```tsx
<Select
  options={options}
  defaultValue="react"
  onChange={(val) => console.log(val)}
/>
```

### All Select props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `(SelectOption \| SelectGroup)[]` | — | **Required.** Option list |
| `value` | `string \| number \| (string\|number)[]` | — | Controlled value |
| `defaultValue` | same as `value` | — | Uncontrolled initial value |
| `onChange` | `(value) => void` | — | Change handler |
| `multiple` | `boolean` | `false` | Multi-select mode |
| `searchable` | `boolean` | `false` | Show search input |
| `clearable` | `boolean` | `false` | Show clear button |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the select |
| `label` | `string` | — | Label above the select |
| `required` | `boolean` | `false` | Adds `*` to label |
| `error` | `string` | — | Error message |
| `hint` | `string` | — | Helper text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `emptyText` | `string` | `'No options found'` | Empty search result text |
| `className` | `string` | — | Class on root element |

#### SelectOption shape

```ts
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

#### SelectGroup shape

```ts
interface SelectGroup {
  group: string;       // group header label
  options: SelectOption[];
}
```

---

## Checkbox

```tsx
import { Checkbox } from 'dosieungon';
```

### Basic (uncontrolled)

```tsx
<Checkbox label="Accept terms and conditions" />
```

### Controlled

```tsx
const [checked, setChecked] = useState(false);

<Checkbox
  label="Subscribe to newsletter"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

### Indeterminate

Useful for "select all" patterns.

```tsx
const allChecked = items.every(i => i.checked);
const someChecked = items.some(i => i.checked);

<Checkbox
  label="Select all"
  checked={allChecked}
  indeterminate={!allChecked && someChecked}
  onChange={(e) => toggleAll(e.target.checked)}
/>
```

### Sizes

```tsx
<Checkbox size="sm" label="Small" />
<Checkbox size="md" label="Medium" />   {/* default */}
<Checkbox size="lg" label="Large" />
```

### All Checkbox props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Controlled checked state |
| `indeterminate` | `boolean` | `false` | Shows dash (partially checked) |
| `label` | `ReactNode` | — | Label text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `disabled` | `boolean` | `false` | Disable interaction |
| `className` | `string` | — | Class on root element |
| `...` | `InputHTMLAttributes` | — | All native `<input>` props (except `type`, `size`) |

---

## Radio

```tsx
import { Radio } from 'dosieungon';
```

### Basic

```tsx
const [plan, setPlan] = useState('free');

<Radio.Group value={plan} onChange={(val) => setPlan(val as string)}>
  <Radio value="free" label="Free" />
  <Radio value="pro" label="Pro" />
  <Radio value="enterprise" label="Enterprise" />
</Radio.Group>
```

### Horizontal layout

```tsx
<Radio.Group
  value={value}
  onChange={setValue}
  direction="horizontal"
>
  <Radio value="yes" label="Yes" />
  <Radio value="no" label="No" />
</Radio.Group>
```

### Disabled

```tsx
{/* Disable entire group */}
<Radio.Group disabled value={value} onChange={setValue}>
  <Radio value="a" label="Option A" />
  <Radio value="b" label="Option B" />
</Radio.Group>

{/* Disable single option */}
<Radio.Group value={value} onChange={setValue}>
  <Radio value="free" label="Free" />
  <Radio value="pro" label="Pro (unavailable)" disabled />
</Radio.Group>
```

### Uncontrolled

```tsx
<Radio.Group defaultValue="free" onChange={(val) => console.log(val)}>
  <Radio value="free" label="Free" />
  <Radio value="pro" label="Pro" />
</Radio.Group>
```

### Radio.Group props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | — | Controlled value |
| `defaultValue` | `string \| number` | — | Uncontrolled initial value |
| `onChange` | `(value) => void` | — | Change handler |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `disabled` | `boolean` | `false` | Disable all radios |
| `name` | `string` | auto-generated | HTML `name` attribute |
| `className` | `string` | — | Class on group wrapper |

### Radio props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string \| number` | **Required.** Option value |
| `label` | `ReactNode` | Label text |
| `disabled` | `boolean` | Disable this option |

---

## Switch

```tsx
import { Switch } from 'dosieungon';
```

### Basic

```tsx
const [enabled, setEnabled] = useState(false);

<Switch
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
  label="Enable notifications"
/>
```

### Label on the left

```tsx
<Switch
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
  label="Dark mode"
  labelPosition="left"
/>
```

### Sizes

```tsx
<Switch size="sm" checked={v} onChange={...} label="Small" />
<Switch size="md" checked={v} onChange={...} label="Medium" />  {/* default */}
<Switch size="lg" checked={v} onChange={...} label="Large" />
```

### All Switch props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | `false` | Controlled state |
| `onChange` | `ChangeEventHandler` | — | Change handler |
| `label` | `ReactNode` | — | Label text |
| `labelPosition` | `'left' \| 'right'` | `'right'` | Label side |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `disabled` | `boolean` | `false` | Disable interaction |
| `className` | `string` | — | Class on root element |
| `...` | `InputHTMLAttributes` | — | All native `<input>` props (except `type`, `size`) |

---

## Modal

```tsx
import { Modal, Button } from 'dosieungon';
```

### Basic

```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open Modal</Button>

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to continue?</p>
</Modal>
```

### With footer actions

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Delete Item"
  footer={
    <>
      <Button variant="outline" color="secondary" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </>
  }
>
  <p>This action cannot be undone.</p>
</Modal>
```

### Sizes

```tsx
<Modal open={open} onClose={onClose} size="sm">...</Modal>    {/* 380px */}
<Modal open={open} onClose={onClose} size="md">...</Modal>    {/* 520px — default */}
<Modal open={open} onClose={onClose} size="lg">...</Modal>    {/* 720px */}
<Modal open={open} onClose={onClose} size="xl">...</Modal>    {/* 960px */}
<Modal open={open} onClose={onClose} size="full">...</Modal>  {/* full viewport */}
```

### Prevent accidental close

```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  closeOnBackdrop={false}
  closeOnEscape={false}
  title="Required Action"
>
  You must complete this form.
</Modal>
```

### All Modal props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | **Required.** Controls visibility |
| `onClose` | `() => void` | — | **Required.** Called on close |
| `title` | `ReactNode` | — | Header title |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Width preset |
| `footer` | `ReactNode` | — | Footer content (actions) |
| `closeOnBackdrop` | `boolean` | `true` | Close on backdrop click |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `hideCloseButton` | `boolean` | `false` | Hide the × button |
| `className` | `string` | — | Class on modal panel |
| `bodyClassName` | `string` | — | Class on body area |

---

## Drawer

```tsx
import { Drawer, Button } from 'dosieungon';
```

### Basic

```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open Drawer</Button>

<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="Settings"
>
  <p>Drawer content goes here.</p>
</Drawer>
```

### Placements

```tsx
<Drawer placement="right" ...>  {/* default — slides from right */}
<Drawer placement="left"  ...>  {/* slides from left */}
<Drawer placement="top"   ...>  {/* slides from top */}
<Drawer placement="bottom" ...> {/* slides from bottom — sheet style */}
```

### Sizes

For `left`/`right`: controls **width**.
For `top`/`bottom`: controls **max-height**.

```tsx
<Drawer size="sm" ...>   {/* left/right: 280px | top/bottom: 30vh */}
<Drawer size="md" ...>   {/* left/right: 400px | top/bottom: 50vh — default */}
<Drawer size="lg" ...>   {/* left/right: 560px | top/bottom: 70vh */}
<Drawer size="full" ...> {/* left/right: 100vw | top/bottom: 100vh */}
```

### With footer

```tsx
<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="Edit Profile"
  footer={
    <>
      <Button variant="outline" color="secondary" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>Save</Button>
    </>
  }
>
  <form>...</form>
</Drawer>
```

### All Drawer props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | **Required.** Controls visibility |
| `onClose` | `() => void` | — | **Required.** Called on close |
| `placement` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Slide direction |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Size preset |
| `title` | `ReactNode` | — | Header title |
| `footer` | `ReactNode` | — | Footer content |
| `closeOnBackdrop` | `boolean` | `true` | Close on backdrop click |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `hideCloseButton` | `boolean` | `false` | Hide the × button |
| `className` | `string` | — | Class on drawer panel |
| `bodyClassName` | `string` | — | Class on body area |

---

## Card

```tsx
import { Card } from 'dosieungon';
```

### Basic

```tsx
<Card>
  <p>Simple card content.</p>
</Card>
```

### With header and footer

```tsx
<Card
  header="User Profile"
  footer={<Button size="sm">Edit</Button>}
>
  <p>John Doe — Software Engineer</p>
</Card>
```

### Hoverable

```tsx
<Card hoverable>
  Hover me for a lift effect.
</Card>
```

### Clickable

```tsx
<Card clickable onClick={() => router.push('/details')}>
  Click anywhere on this card.
</Card>
```

### Shadow variant

```tsx
<Card shadow>
  No border, floating shadow.
</Card>
```

### All Card props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | — | Header content |
| `footer` | `ReactNode` | — | Footer content |
| `hoverable` | `boolean` | `false` | Lift animation on hover |
| `clickable` | `boolean` | `false` | Renders as `<button>`, full click area |
| `shadow` | `boolean` | `false` | Shadow instead of border |
| `bodyClassName` | `string` | — | Class on body section |
| `className` | `string` | — | Class on root element |
| `...` | `HTMLAttributes<HTMLDivElement>` | — | All native div/button props |

---

## Chip

```tsx
import { Chip } from 'dosieungon';
```

### Basic

```tsx
<Chip>Label</Chip>
<Chip color="danger">Error</Chip>
<Chip color="success">Active</Chip>
<Chip color="warning">Pending</Chip>
<Chip color="secondary">Draft</Chip>
```

### Outlined

```tsx
<Chip variant="outlined">Default</Chip>
<Chip variant="outlined" color="danger">Danger</Chip>
<Chip variant="outlined" color="success">Success</Chip>
```

### Closable

```tsx
const [tags, setTags] = useState(['React', 'TypeScript', 'Vite']);

{tags.map(tag => (
  <Chip
    key={tag}
    onClose={() => setTags(tags.filter(t => t !== tag))}
  >
    {tag}
  </Chip>
))}
```

### Clickable

```tsx
<Chip onClick={() => setFilter('all')}>All</Chip>
<Chip onClick={() => setFilter('active')}>Active</Chip>
```

### Sizes

```tsx
<Chip size="sm">Small</Chip>
<Chip size="md">Medium</Chip>   {/* default */}
<Chip size="lg">Large</Chip>
```

### All Chip props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'filled' \| 'outlined'` | `'filled'` | Visual style |
| `color` | `'primary' \| 'secondary' \| 'danger' \| 'warning' \| 'success'` | `'primary'` | Color |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `onClose` | `(e) => void` | — | Show × button, called on click |
| `onClick` | `(e) => void` | — | Makes chip interactive (renders as `<button>`) |
| `className` | `string` | — | Extra CSS class |

---

## Customization

### Pass className for one-off overrides

Every component accepts `className`. Your classes are merged with library classes and applied last so they take precedence.

```tsx
<Button className="w-full">Full Width</Button>

<Card className="border-2 border-blue-500">Custom border</Card>
```

### Override design tokens globally

All colors, sizes, and spacing are CSS custom properties. Override them once in your global CSS:

```css
/* globals.css */
:root {
  --dsg-primary: #7c3aed;         /* purple instead of blue */
  --dsg-primary-hover: #6d28d9;
  --dsg-primary-active: #5b21b6;
  --dsg-primary-subtle: rgba(124, 58, 237, 0.1);
  --dsg-radius: 4px;              /* sharper corners */
}
```

### Override for a specific section

```tsx
<div style={{ '--dsg-primary': '#7c3aed' } as React.CSSProperties}>
  <Button>Purple Button</Button>
</div>
```

---

## Dark Mode

Dark mode works automatically via `prefers-color-scheme`. No setup needed.

### Force dark mode

Add `data-dsg-theme="dark"` to any ancestor element:

```html
<!-- Force dark for the entire page -->
<html data-dsg-theme="dark">
```

```tsx
// Force dark for a specific section
<div data-dsg-theme="dark">
  <Card>This card is always dark</Card>
</div>
```

### Force light mode

```html
<html data-dsg-theme="light">
```

### Controlled dark mode toggle

```tsx
function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-dsg-theme',
      dark ? 'dark' : 'light'
    );
  }, [dark]);

  return (
    <Switch
      checked={dark}
      onChange={(e) => setDark(e.target.checked)}
      label="Dark mode"
    />
  );
}
```

---

## Next.js Setup

No extra setup required. Just import and use.

```tsx
// app/page.tsx or pages/index.tsx
import { Button } from 'dosieungon';

export default function Page() {
  return <Button>Hello</Button>;
}
```

For interactive components (Modal, Select, Drawer, etc.) in App Router, add `'use client'`:

```tsx
'use client';

import { useState } from 'react';
import { Modal, Button } from 'dosieungon';

export default function Page() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Hello">
        Content
      </Modal>
    </>
  );
}
```
