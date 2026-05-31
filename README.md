# dosieungon-ui

Lightweight, beautiful React UI component library. Install and use — no extra config needed.

> 📖 **Full documentation:** [dosieungon.com/ui](https://dosieungon.com/ui)

```bash
npm install dosieungon-ui
```

- Zero runtime dependencies
- CSS auto-injected — no import needed
- TypeScript ready (full type support)
- Dark mode via built-in `DSNProvider` — auto follows system, persists to localStorage
- Works with React 17+, Next.js (App Router & Pages Router)

---

## Quick Start

```tsx
import { Button, Modal, Select } from 'dosieungon-ui';

export default function App() {
  return <Button>Click me</Button>;
}
```

That's it. No CSS import. No provider wrapper.

---

## Table of Contents

- [DSNProvider & Dark Mode](#dsnprovider--dark-mode)
- [Button](#button)
- [Input](#input)
- [InputNumber](#inputnumber)
- [Select](#select)
- [Checkbox](#checkbox)
- [Radio](#radio)
- [Switch](#switch)
- [Segmented](#segmented)
- [Modal](#modal)
- [Drawer](#drawer)
- [Card](#card)
- [Chip](#chip)
- [Table](#table)
- [Breadcrumb](#breadcrumb)
- [Tooltip](#tooltip)
- [Popover](#popover)
- [Popconfirm](#popconfirm)
- [Notification](#notification)
- [DatePicker](#datepicker)
- [TimePicker](#timepicker)
- [DateTimePicker](#datetimepicker)
- [ColorPicker](#colorpicker)
- [Skeleton](#skeleton)
- [Customization](#customization)

---

## Button

```tsx
import { Button } from 'dosieungon-ui';
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
import { Button } from 'dosieungon-ui';

// Left icon
<Button leftIcon={<SearchIcon />}>Search</Button>

// Right icon
<Button rightIcon={<ArrowIcon />}>Next</Button>

// Icon only (square button)
<Button iconOnly leftIcon={<PlusIcon />} aria-label="Add" />
```

### Rounded

```tsx
<Button rounded="sm">Slightly rounded</Button>
<Button rounded="lg">More rounded</Button>
<Button rounded="full">Pill button</Button>
<Button rounded="none">Sharp corners</Button>
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
| `className` | `string` | — | Extra CSS class |
| `...` | `ButtonHTMLAttributes` | — | All native `<button>` props |

---

## Input

```tsx
import { Input } from 'dosieungon-ui';
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
| `multiline` | `true` | — | Render as `<textarea>` |
| `rows` | `number` | — | Rows (textarea only) |
| `wrapperClassName` | `string` | — | Class on the input wrapper div |
| `className` | `string` | — | Class on the root element |
| `...` | `InputHTMLAttributes` | — | All native `<input>` props |

---

## Select

Custom dropdown — single select, multi-select, search, option groups.

```tsx
import { Select } from 'dosieungon-ui';
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
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
import { Checkbox } from 'dosieungon-ui';
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius of the indicator |
| `disabled` | `boolean` | `false` | Disable interaction |
| `className` | `string` | — | Class on root element |
| `...` | `InputHTMLAttributes` | — | All native `<input>` props (except `type`, `size`) |

---

## Radio

```tsx
import { Radio } from 'dosieungon-ui';
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius of the indicator |
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
import { Switch } from 'dosieungon-ui';
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius of the track |
| `disabled` | `boolean` | `false` | Disable interaction |
| `className` | `string` | — | Class on root element |
| `...` | `InputHTMLAttributes` | — | All native `<input>` props (except `type`, `size`) |

---

## Modal

```tsx
import { Modal, Button } from 'dosieungon-ui';
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius of the panel |
| `className` | `string` | — | Class on modal panel |
| `bodyClassName` | `string` | — | Class on body area |

---

## Drawer

```tsx
import { Drawer, Button } from 'dosieungon-ui';
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
<Drawer placement="right" ...>   {/* default — slides from right */}
<Drawer placement="left"  ...>   {/* slides from left */}
<Drawer placement="top"   ...>   {/* slides from top */}
<Drawer placement="bottom" ...>  {/* slides from bottom — sheet style */}
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius of the panel |
| `className` | `string` | — | Class on drawer panel |
| `bodyClassName` | `string` | — | Class on body area |

---

## Card

```tsx
import { Card } from 'dosieungon-ui';
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
| `bodyClassName` | `string` | — | Class on body section |
| `className` | `string` | — | Class on root element |
| `...` | `HTMLAttributes<HTMLDivElement>` | — | All native div/button props |

---

## Chip

```tsx
import { Chip } from 'dosieungon-ui';
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
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
| `onClose` | `(e) => void` | — | Show × button, called on click |
| `onClick` | `(e) => void` | — | Makes chip interactive (renders as `<button>`) |
| `className` | `string` | — | Extra CSS class |

---

## Table

Full-featured data table with sorting, fixed columns, inner scroll, pagination, and custom colors.

```tsx
import { Table } from 'dosieungon-ui';
import type { TableColumn } from 'dosieungon-ui';
```

### Basic

```tsx
const columns: TableColumn<User>[] = [
  { key: 'id',    title: '#',    dataIndex: 'id',    width: 56, align: 'center' },
  { key: 'name',  title: 'Name', dataIndex: 'name',  sortable: true },
  { key: 'dept',  title: 'Dept', dataIndex: 'dept' },
  { key: 'score', title: 'Score',dataIndex: 'score', sortable: true, align: 'right' },
];

<Table columns={columns} data={users} rowKey="id" hoverable />
```

### Custom cell renderer

```tsx
const columns: TableColumn<User>[] = [
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (value, row) => (
      <Chip color={value === 'Active' ? 'success' : 'secondary'} size="sm">
        {value}
      </Chip>
    ),
  },
];
```

### Fixed columns (horizontal scroll)

```tsx
const columns: TableColumn<User>[] = [
  { key: 'id',     title: '#',    dataIndex: 'id',     width: 60,  fixed: 'left'  },
  { key: 'name',   title: 'Name', dataIndex: 'name',   width: 160, fixed: 'left'  },
  // ... scrollable columns ...
  { key: 'status', title: 'Status', dataIndex: 'status', width: 120, fixed: 'right' },
];

<Table columns={columns} data={data} rowKey="id" />
```

### Inner scroll (scrollY)

```tsx
<Table
  columns={columns}
  data={data}
  rowKey="id"
  scrollY={300}   // max body height; header sticks automatically
  hoverable
/>
```

### Pagination

```tsx
<Table
  columns={columns}
  data={data}          // pass the full dataset
  rowKey="id"
  pagination={{
    pageSize: 10,
    showTotal: true,
    pageSizeOptions: [10, 25, 50],
  }}
/>
```

### Custom colors

```tsx
<Table
  columns={columns}
  data={data}
  rowKey="id"
  hoverable
  headerBg="#1e1b4b"
  headerColor="#c7d2fe"
  hoverBg="rgba(99, 102, 241, 0.08)"
/>
```

### All Table props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn<T>[]` | — | **Required.** Column definitions |
| `data` | `T[]` | — | **Required.** Row data array |
| `rowKey` | `string \| (row) => string \| number` | — | Unique key per row |
| `loading` | `boolean` | `false` | Show skeleton rows |
| `loadingRows` | `number` | `5` | Skeleton row count |
| `bordered` | `boolean` | `false` | Border every cell |
| `striped` | `boolean` | `false` | Alternate even-row background |
| `hoverable` | `boolean` | `false` | Highlight rows on hover |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cell padding preset |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius of the wrapper |
| `scrollY` | `string \| number` | — | Max body height — enables vertical scroll |
| `fullWidth` | `boolean` | `true` | Stretch table to fill container |
| `stickyHeader` | `boolean` | `false` | Pin header row (auto-on with `scrollY`) |
| `headerBg` | `string` | — | Custom header background color |
| `headerColor` | `string` | — | Custom header text color |
| `bodyBg` | `string` | — | Custom table body background |
| `hoverBg` | `string` | — | Custom row hover background |
| `empty` | `ReactNode` | `'Không có dữ liệu'` | Empty-state content |
| `caption` | `string` | — | Caption below the table |
| `pagination` | `TablePaginationConfig` | — | Enable pagination bar |
| `onSort` | `(key, dir) => void` | — | Sort callback (server-side sort) |
| `className` | `string` | — | Extra class on the wrapper |

#### TableColumn shape

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `key` | `string` | — | **Required.** Unique column id |
| `title` | `ReactNode` | — | **Required.** Header content |
| `dataIndex` | `string` | — | Row field to read |
| `render` | `(value, row, index) => ReactNode` | — | Custom cell renderer |
| `width` | `string \| number` | — | Column width (required for fixed columns) |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Cell text alignment |
| `sortable` | `boolean` | `false` | Enable click-to-sort |
| `fixed` | `'left' \| 'right'` | — | Pin column — requires `width` |

#### TablePaginationConfig shape

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSize` | `number` | `10` | Rows per page |
| `total` | `number` | — | Override total for server-side pagination |
| `showTotal` | `boolean` | `true` | Show "X–Y / Z" counter |
| `pageSizeOptions` | `number[]` | — | Render a page-size selector |
| `onChange` | `(page, pageSize) => void` | — | Called on page or size change |

---

## Breadcrumb

```tsx
import { Breadcrumb } from 'dosieungon-ui';
```

### Basic

```tsx
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Settings', href: '/settings' },
    { label: 'Profile' },
  ]}
/>
```

### With onClick handler

```tsx
<Breadcrumb
  items={[
    { label: 'Home', onClick: () => router.push('/') },
    { label: 'Products', onClick: () => router.push('/products') },
    { label: 'Detail' },
  ]}
/>
```

### Custom separator

```tsx
<Breadcrumb
  items={items}
  separator={<ChevronRightIcon />}
/>
```

### Sizes

```tsx
<Breadcrumb items={items} size="sm" />
<Breadcrumb items={items} size="md" />   {/* default */}
<Breadcrumb items={items} size="lg" />
```

### All Breadcrumb props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | — | **Required.** Breadcrumb items — last item is the current page |
| `separator` | `ReactNode` | `'/'` | Separator between items |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `className` | `string` | — | Extra CSS class |
| `...` | `HTMLAttributes<HTMLElement>` | — | All native `<nav>` props |

#### BreadcrumbItem shape

```ts
interface BreadcrumbItem {
  label: ReactNode;   // display content
  href?: string;      // renders as <a> when provided
  onClick?: (e) => void; // renders as <button> when provided (no href)
}
```

---

## InputNumber

Numeric input with formatting, min/max clamping, prefix/suffix, and optional spinner controls.

```tsx
import { InputNumber } from 'dosieungon-ui';
```

### Basic

```tsx
<InputNumber placeholder="Enter amount" />
```

### With min / max / step

```tsx
<InputNumber
  min={0}
  max={100}
  step={5}
  defaultValue={50}
  onChange={(value) => console.log(value)}
/>
```

### Currency formatting

```tsx
<InputNumber
  currency
  prefix="$"
  precision={2}
  placeholder="0.00"
/>
```

### With spinner controls

```tsx
<InputNumber
  controls
  min={1}
  max={99}
  defaultValue={1}
/>
```

### With label and error

```tsx
<InputNumber
  label="Quantity"
  required
  min={1}
  error={qty < 1 ? 'Must be at least 1' : undefined}
/>
```

### All InputNumber props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Controlled value |
| `defaultValue` | `number` | — | Uncontrolled initial value |
| `onChange` | `(value: number \| null, text: string) => void` | — | Called on every keystroke |
| `min` | `number` | — | Minimum value (enforced on blur and spinner) |
| `max` | `number` | — | Maximum value (enforced on blur and spinner) |
| `step` | `number` | `1` | Spinner increment |
| `precision` | `number` | — | Max decimal places |
| `currency` | `boolean` | `false` | Show thousand separators while typing |
| `thousandSeparator` | `string` | `','` | Thousand separator character |
| `decimalSeparator` | `string` | `'.'` | Decimal separator character |
| `prefix` | `string` | — | Text shown before the value (e.g. `'$'`) |
| `suffix` | `string` | — | Text shown after the value (e.g. `'VND'`) |
| `controls` | `boolean` | `false` | Show ▲ ▼ spinner buttons |
| `label` | `string` | — | Label above input |
| `required` | `boolean` | `false` | Adds `*` to label |
| `error` | `string` | — | Error message |
| `hint` | `string` | — | Helper text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
| `wrapperClassName` | `string` | — | Class on the input wrapper |
| `className` | `string` | — | Class on the root element |
| `...` | `InputHTMLAttributes` | — | All native `<input>` props (except `type`, `size`, `value`, `onChange`) |

---

## Segmented

Tab-style control for selecting one option from a set.

```tsx
import { Segmented } from 'dosieungon-ui';
```

### Basic (uncontrolled)

```tsx
<Segmented
  options={['Daily', 'Weekly', 'Monthly']}
  onChange={(value) => console.log(value)}
/>
```

### Controlled

```tsx
const [view, setView] = useState('list');

<Segmented
  options={['list', 'grid', 'table']}
  value={view}
  onChange={(v) => setView(v as string)}
/>
```

### With icons

```tsx
<Segmented
  options={[
    { value: 'list', label: 'List', icon: <ListIcon /> },
    { value: 'grid', label: 'Grid', icon: <GridIcon /> },
  ]}
  defaultValue="list"
/>
```

### Block (full-width)

```tsx
<Segmented
  options={['A', 'B', 'C']}
  block
/>
```

### Sizes

```tsx
<Segmented options={['A', 'B']} size="sm" />
<Segmented options={['A', 'B']} size="md" />   {/* default */}
<Segmented options={['A', 'B']} size="lg" />
```

### All Segmented props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `(string \| number \| SegmentedOption)[]` | — | **Required.** Option list |
| `value` | `string \| number` | — | Controlled selected value |
| `defaultValue` | `string \| number` | — | Uncontrolled initial value (defaults to first option) |
| `onChange` | `(value) => void` | — | Called when active segment changes |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `disabled` | `boolean` | `false` | Disable all segments |
| `block` | `boolean` | `false` | Stretch to fill container |
| `activeBold` | `boolean` | `false` | Bold the active segment label |
| `background` | `string` | — | Custom track background color |
| `activeBackground` | `string` | — | Custom active indicator color |
| `textColor` | `string` | — | Custom inactive text color |
| `activeTextColor` | `string` | — | Custom active text color |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
| `className` | `string` | — | Extra CSS class |

#### SegmentedOption shape

```ts
interface SegmentedOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}
```

---

## Tooltip

Lightweight floating label triggered on hover, click, or focus.

```tsx
import { Tooltip } from 'dosieungon-ui';
```

### Basic

```tsx
<Tooltip title="This is a tooltip">
  <Button>Hover me</Button>
</Tooltip>
```

### Placement

```tsx
<Tooltip title="Top left" placement="topLeft">
  <Button>TL</Button>
</Tooltip>
```

Available placements: `top`, `topLeft`, `topRight`, `bottom`, `bottomLeft`, `bottomRight`, `left`, `leftTop`, `leftBottom`, `right`, `rightTop`, `rightBottom`

### Click trigger

```tsx
<Tooltip title="Click tooltip" trigger="click">
  <Button>Click me</Button>
</Tooltip>
```

### Custom color

```tsx
<Tooltip title="Custom color" color="#7c3aed">
  <Button>Purple</Button>
</Tooltip>
```

### Disable

```tsx
<Tooltip title="Disabled tooltip" disabled>
  <Button>No tooltip</Button>
</Tooltip>
```

### All Tooltip props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | **Required.** Tooltip content — `null`/`undefined` disables it |
| `placement` | `TooltipPlacement` | `'top'` | Position relative to the trigger |
| `trigger` | `'hover' \| 'click' \| 'focus' \| TooltipTrigger[]` | `'hover'` | How to activate |
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state |
| `onOpenChange` | `(open) => void` | — | Called when visibility changes |
| `color` | `string` | — | Custom background + arrow color |
| `arrow` | `boolean` | `true` | Show the directional arrow |
| `mouseEnterDelay` | `number` | `100` | Delay before showing (ms) |
| `mouseLeaveDelay` | `number` | `100` | Delay before hiding (ms) |
| `disabled` | `boolean` | `false` | Disable the tooltip |
| `overlayClassName` | `string` | — | Extra class on the overlay |

---

## Popover

Rich floating card with a title, body content, and optional close button.

```tsx
import { Popover } from 'dosieungon-ui';
```

### Basic

```tsx
<Popover
  title="Information"
  content={<p>Popover body content goes here.</p>}
>
  <Button>Click me</Button>
</Popover>
```

### Hover trigger

```tsx
<Popover
  content="Quick info on hover"
  trigger="hover"
>
  <span>Hover me</span>
</Popover>
```

### With close button

```tsx
<Popover
  title="Settings"
  content={<SettingsForm />}
  showCloseButton
>
  <Button>Open</Button>
</Popover>
```

### Placement

```tsx
<Popover content="Bottom right" placement="bottomRight">
  <Button>BR</Button>
</Popover>
```

### All Popover props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | — | **Required.** Body content |
| `title` | `ReactNode` | — | Header title |
| `placement` | `PopoverPlacement` | `'top'` | Position relative to trigger |
| `trigger` | `'hover' \| 'click' \| 'focus' \| PopoverTrigger[]` | `'click'` | How to activate |
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state |
| `onOpenChange` | `(open) => void` | — | Called when visibility changes |
| `arrow` | `boolean` | `true` | Show the directional arrow |
| `showCloseButton` | `boolean` | `false` | Show × button in header |
| `mouseEnterDelay` | `number` | `100` | Delay before showing on hover (ms) |
| `mouseLeaveDelay` | `number` | `100` | Delay before hiding on hover (ms) |
| `disabled` | `boolean` | `false` | Disable the popover |
| `overlayClassName` | `string` | — | Extra class on the overlay |

---

## Popconfirm

Inline confirmation bubble — asks for confirmation before a destructive action.

```tsx
import { Popconfirm, Button } from 'dosieungon-ui';
```

### Basic

```tsx
<Popconfirm
  title="Delete this item?"
  onConfirm={() => handleDelete()}
  onCancel={() => console.log('cancelled')}
>
  <Button variant="danger">Delete</Button>
</Popconfirm>
```

### With description

```tsx
<Popconfirm
  title="Are you sure?"
  description="This action cannot be undone."
  onConfirm={handleDelete}
>
  <Button variant="danger">Delete</Button>
</Popconfirm>
```

### Async confirm (shows loading)

```tsx
<Popconfirm
  title="Submit changes?"
  onConfirm={async () => {
    await saveToServer();
  }}
>
  <Button>Save</Button>
</Popconfirm>
```

### Custom button labels

```tsx
<Popconfirm
  title="Remove member?"
  okText="Yes, remove"
  cancelText="Keep"
  okType="danger"
  onConfirm={handleRemove}
>
  <Button variant="outline" color="danger">Remove</Button>
</Popconfirm>
```

### All Popconfirm props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `ReactNode` | — | **Required.** Confirmation question |
| `description` | `ReactNode` | — | Secondary text below the title |
| `icon` | `ReactNode` | warning icon | Icon next to the title |
| `placement` | `PopconfirmPlacement` | `'top'` | Position relative to trigger |
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state |
| `onOpenChange` | `(open) => void` | — | Called when visibility changes |
| `onConfirm` | `(e) => void \| Promise<void>` | — | Called on OK — return a Promise to show loading |
| `onCancel` | `(e) => void` | — | Called on Cancel |
| `okText` | `ReactNode` | `'OK'` | OK button label |
| `cancelText` | `ReactNode` | `'Cancel'` | Cancel button label |
| `okType` | `ButtonVariant` | `'danger'` | Variant for the OK button |
| `arrow` | `boolean` | `true` | Show the directional arrow |
| `disabled` | `boolean` | `false` | Prevent the popconfirm from opening |
| `overlayClassName` | `string` | — | Extra class on the overlay |

---

## Notification

Toast notifications rendered in a portal. Use the `useNotification` hook to get an API + a context holder element.

```tsx
import { useNotification } from 'dosieungon-ui';
```

### Setup

Render `contextHolder` once near the top of your component tree. It's the portal anchor for all notifications.

```tsx
function App() {
  const [api, contextHolder] = useNotification();

  return (
    <>
      {contextHolder}
      <Button onClick={() => api.success({ message: 'Saved!' })}>
        Save
      </Button>
    </>
  );
}
```

### Types

```tsx
api.success({ message: 'Operation successful', description: 'Your changes have been saved.' });
api.error({ message: 'Something went wrong', description: 'Please try again.' });
api.warning({ message: 'Warning', description: 'Storage is almost full.' });
api.info({ message: 'Info', description: 'A new version is available.' });
```

### Placement

```tsx
api.info({
  message: 'Bottom right',
  placement: 'bottomRight',  // default: 'topRight'
});
```

Available placements: `topLeft`, `topCenter`, `topRight`, `bottomLeft`, `bottomCenter`, `bottomRight`

### Persistent notification (no auto-dismiss)

```tsx
api.warning({ message: 'Action required', duration: 0 });
```

### Update an existing notification

```tsx
api.info({ key: 'upload', message: 'Uploading…' });
// later:
api.success({ key: 'upload', message: 'Upload complete!' });
```

### Dismiss programmatically

```tsx
api.destroy('upload');   // by key
api.destroy();           // dismiss all
```

### Action button

```tsx
api.error({
  message: 'Connection lost',
  btn: <Button size="sm" onClick={retry}>Retry</Button>,
  duration: 0,
});
```

### Global config via hook options

```tsx
const [api, contextHolder] = useNotification({
  placement: 'bottomRight',
  duration: 3000,
  maxCount: 5,
});
```

### useNotification config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placement` | `NotificationPlacement` | `'topRight'` | Default placement for all notifications |
| `duration` | `number` | `4500` | Default auto-dismiss delay in ms |
| `maxCount` | `number` | — | Max simultaneous notifications |

### NotificationConfig (per-notification)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `key` | `string` | auto | Unique key — reuse to update an existing notification |
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Notification type |
| `message` | `ReactNode` | — | Bold title text |
| `description` | `ReactNode` | — | Secondary body text |
| `duration` | `number` | `4500` | Auto-dismiss delay — `0` = no auto-dismiss |
| `closable` | `boolean` | `true` | Show × close button |
| `onClose` | `() => void` | — | Called when dismissed |
| `icon` | `ReactNode` | — | Replace the default type icon |
| `btn` | `ReactNode` | — | Action button below the description |
| `placement` | `NotificationPlacement` | hook default | Override placement for this notification |

---

## DatePicker

Calendar picker for selecting a date.

```tsx
import { DatePicker } from 'dosieungon-ui';
```

### Basic

```tsx
const [date, setDate] = useState<Date | null>(null);

<DatePicker value={date} onChange={setDate} />
```

### With label and error

```tsx
<DatePicker
  label="Date of birth"
  required
  value={dob}
  onChange={setDob}
  error={!dob ? 'Required' : undefined}
/>
```

### Custom format

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  format="DD/MM/YYYY"
/>
```

### Clearable with min/max

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  clearable
  minDate={new Date()}
/>
```

### Disable specific dates

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  disabledDate={(d) => d.getDay() === 0 || d.getDay() === 6}  // disable weekends
/>
```

### Locale

```tsx
// Auto-detect from <html lang="vi"> — no prop needed

// Or pass explicitly:
<DatePicker value={date} onChange={setDate} locale="vi" />
```

Built-in locales: `en`, `vi`. Pass a custom `DatePickerLocale` object for full control.

### All DatePicker props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | — | Controlled date value |
| `defaultValue` | `Date \| null` | — | Uncontrolled initial value |
| `onChange` | `(date: Date \| null) => void` | — | Called on date select or clear |
| `placeholder` | `string` | `'Select date'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the picker |
| `clearable` | `boolean` | `false` | Show clear button when a date is selected |
| `format` | `string` | `'MM/DD/YYYY'` | Display format (`YYYY`, `MM`, `DD` tokens) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `minDate` | `Date` | — | Earliest selectable date |
| `maxDate` | `Date` | — | Latest selectable date |
| `disabledDate` | `(date: Date) => boolean` | — | Return `true` to disable a specific date |
| `label` | `string` | — | Label above the trigger |
| `required` | `boolean` | `false` | Adds `*` to label |
| `error` | `string` | — | Error message |
| `hint` | `string` | — | Helper text |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
| `showIcon` | `boolean` | `true` | Show the calendar icon |
| `icon` | `ReactNode` | — | Replace the default calendar icon |
| `locale` | `string \| DatePickerLocale` | auto | Panel locale (BCP-47 tag or custom object) |
| `className` | `string` | — | Extra CSS class |

---

## TimePicker

Scroll-column picker for selecting a time value.

```tsx
import { TimePicker } from 'dosieungon-ui';
```

### Basic

```tsx
const [time, setTime] = useState<string | null>(null);

<TimePicker value={time} onChange={setTime} />
```

### With seconds

```tsx
<TimePicker
  value={time}
  onChange={setTime}
  timeMode="HH:mm:ss"
/>
```

### Hour only

```tsx
<TimePicker
  value={hour}
  onChange={setHour}
  timeMode="HH"
  placeholder="Select hour"
/>
```

### With label and clearable

```tsx
<TimePicker
  label="Meeting time"
  required
  clearable
  value={time}
  onChange={setTime}
/>
```

### All TimePicker props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` | — | Controlled value (format matches `timeMode`) |
| `defaultValue` | `string \| null` | — | Uncontrolled initial value |
| `onChange` | `(time: string \| null) => void` | — | Called on confirm or clear |
| `timeMode` | `'HH' \| 'HH:mm' \| 'HH:mm:ss'` | `'HH:mm'` | Which time units to show |
| `placeholder` | `string` | `'Select time'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the picker |
| `clearable` | `boolean` | `false` | Show clear button |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `label` | `string` | — | Label above the trigger |
| `required` | `boolean` | `false` | Adds `*` to label |
| `error` | `string` | — | Error message |
| `hint` | `string` | — | Helper text |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
| `showIcon` | `boolean` | `true` | Show the clock icon |
| `icon` | `ReactNode` | — | Replace the default clock icon |
| `locale` | `string \| TimePickerLocale` | auto | Panel locale (`en`/`vi` or custom object) |
| `className` | `string` | — | Extra CSS class |

---

## DateTimePicker

Combined date + time picker in a single panel.

```tsx
import { DateTimePicker } from 'dosieungon-ui';
```

### Basic

```tsx
const [dt, setDt] = useState<Date | null>(null);

<DateTimePicker value={dt} onChange={setDt} />
```

### With seconds

```tsx
<DateTimePicker
  value={dt}
  onChange={setDt}
  timeMode="HH:mm:ss"
/>
```

### With label, clearable, and min date

```tsx
<DateTimePicker
  label="Scheduled at"
  required
  clearable
  value={dt}
  onChange={setDt}
  minDate={new Date()}
/>
```

### Custom format

```tsx
<DateTimePicker
  value={dt}
  onChange={setDt}
  format="DD/MM/YYYY HH:mm"
/>
```

### All DateTimePicker props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | — | Controlled value |
| `defaultValue` | `Date \| null` | — | Uncontrolled initial value |
| `onChange` | `(date: Date \| null) => void` | — | Called on confirm or clear |
| `timeMode` | `'HH' \| 'HH:mm' \| 'HH:mm:ss'` | `'HH:mm'` | Which time units to show |
| `placeholder` | `string` | `'Select date & time'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the picker |
| `clearable` | `boolean` | `false` | Show clear button |
| `format` | `string` | auto | Display format (auto-set from `timeMode`) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size preset |
| `minDate` | `Date` | — | Earliest selectable date |
| `maxDate` | `Date` | — | Latest selectable date |
| `disabledDate` | `(date: Date) => boolean` | — | Return `true` to disable a date |
| `label` | `string` | — | Label above the trigger |
| `required` | `boolean` | `false` | Adds `*` to label |
| `error` | `string` | — | Error message |
| `hint` | `string` | — | Helper text |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | — | Override corner radius |
| `showIcon` | `boolean` | `true` | Show the icon |
| `icon` | `ReactNode` | — | Replace the default icon |
| `locale` | `string \| DateTimePickerLocale` | auto | Panel locale |
| `className` | `string` | — | Extra CSS class |

---

## ColorPicker

HSV canvas color picker with solid and gradient modes.

```tsx
import { ColorPicker } from 'dosieungon-ui';
```

### Solid color

```tsx
const [color, setColor] = useState('#0285F7');

<ColorPicker value={color} onChange={setColor} />
```

### Gradient mode

```tsx
const [gradient, setGradient] = useState('linear-gradient(90deg, #0285F7 0%, #8B5CF6 100%)');

<ColorPicker
  value={gradient}
  onChange={setGradient}
  mode="gradient"
/>
```

### Both modes (tab switcher)

```tsx
<ColorPicker
  value={value}
  onChange={setValue}
  mode="both"
/>
```

### Compact trigger (swatch only)

```tsx
<ColorPicker
  value={color}
  onChange={setColor}
  showColorCode={false}
  showArrow={false}
/>
```

### Custom trigger

```tsx
<ColorPicker
  value={color}
  onChange={setColor}
  trigger={({ value }) => (
    <div style={{ width: 32, height: 32, background: value, borderRadius: 4 }} />
  )}
/>
```

### All ColorPicker props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled value — hex (`#RRGGBB`) or `linear-gradient(…)` |
| `defaultValue` | `string` | — | Uncontrolled initial value |
| `onChange` | `(value: string) => void` | — | Called on every color change |
| `mode` | `'solid' \| 'gradient' \| 'both'` | `'both'` | Which mode(s) to show |
| `disabled` | `boolean` | `false` | Disable the picker |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Trigger button size |
| `presets` | `string[]` | 12 default swatches | Quick-access color presets |
| `showInput` | `boolean` | `true` | Show hex input field |
| `showPresets` | `boolean` | `true` | Show preset swatches |
| `showArrow` | `boolean` | `true` | Show chevron on trigger |
| `showColorCode` | `boolean` | `true` | Show hex code on trigger |
| `triggerRadius` | `string \| number` | — | Custom border-radius for the trigger |
| `trigger` | `ReactNode \| (state) => ReactNode` | — | Replace the default trigger |
| `placeholder` | `string` | `'Pick a color'` | Trigger placeholder when no value |
| `className` | `string` | — | Extra CSS class |

---

## Skeleton

Loading placeholder that mimics content layout before data arrives.

```tsx
import { Skeleton } from 'dosieungon-ui';
```

### Basic (wraps real content)

```tsx
<Skeleton loading={isLoading}>
  <ArticleContent />
</Skeleton>
```

### With avatar

```tsx
<Skeleton loading={isLoading} active avatar>
  <UserProfile />
</Skeleton>
```

### Custom paragraph rows

```tsx
<Skeleton
  loading={isLoading}
  active
  paragraph={{ rows: 5 }}
  title={{ width: '40%' }}
>
  <Content />
</Skeleton>
```

### Standalone sub-components

```tsx
{/* Button skeleton */}
<Skeleton.Button active />
<Skeleton.Button active size="lg" block />

{/* Avatar skeleton */}
<Skeleton.Avatar active />
<Skeleton.Avatar active size="lg" shape="square" />

{/* Input skeleton */}
<Skeleton.Input active />
<Skeleton.Input active block />

{/* Image skeleton */}
<Skeleton.Image active />
```

### Skeleton props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `true` | When `false`, renders `children` instead |
| `active` | `boolean` | `false` | Enable the shimmer animation |
| `avatar` | `boolean \| SkeletonAvatarConfig` | `false` | Show an avatar placeholder |
| `title` | `boolean \| SkeletonTitleConfig` | `true` | Show a title line |
| `paragraph` | `boolean \| SkeletonParagraphConfig` | `true` | Show paragraph lines |
| `round` | `boolean` | `false` | Pill-shaped corners on all elements |
| `className` | `string` | — | Extra CSS class |

#### SkeletonAvatarConfig

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `shape` | `'circle' \| 'square'` | `'circle'` |

#### SkeletonTitleConfig

| Prop | Type | Description |
|------|------|-------------|
| `width` | `string \| number` | Width of the title bar |

#### SkeletonParagraphConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `3` | Number of lines |
| `width` | `string \| number \| Array<string\|number>` | — | Width(s) of the lines |

### Skeleton.Button props

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `active` | `boolean` | `false` |
| `round` | `boolean` | `false` |
| `block` | `boolean` | `false` |

### Skeleton.Avatar props

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `shape` | `'circle' \| 'square'` | `'circle'` |
| `active` | `boolean` | `false` |

### Skeleton.Input props

| Prop | Type | Default |
|------|------|---------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `active` | `boolean` | `false` |
| `block` | `boolean` | `false` |

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

## DSNProvider & Dark Mode

Wrap your app once with `DSNProvider` — all library components inside automatically respond to the active theme.

```tsx
import { DSNProvider } from 'dosieungon-ui';

export default function App({ Component, pageProps }) {
  return (
    <DSNProvider>
      <Component {...pageProps} />
    </DSNProvider>
  );
}
```

**What it does by default:**
- Reads `localStorage` for a previously saved preference
- Falls back to `prefers-color-scheme` (system)
- Persists the user's choice back to `localStorage`
- Sets `data-dsg-theme` on `<html>` so portals (Modal, Drawer) also get the theme
- Toggles `class="dark"/"light"` on `<html>` (Tailwind `dark:` utilities work out of the box)

### Toggle theme

```tsx
import { useTheme } from 'dosieungon-ui';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      {resolvedTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

### DSNProvider props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultTheme` | `'light' \| 'dark' \| 'system'` | `'system'` | Initial theme when no localStorage value exists |
| `theme` | `'light' \| 'dark' \| 'system'` | — | Controlled theme — makes Provider controlled |
| `storageKey` | `string` | `'dsg-theme'` | localStorage key to persist the choice |
| `syncDocument` | `boolean` | `true` | Mirror theme onto `<html>` for portals and Tailwind |

### useTheme return value

| Field | Type | Description |
|-------|------|-------------|
| `theme` | `'light' \| 'dark' \| 'system'` | Active setting (may be `'system'`) |
| `resolvedTheme` | `'light' \| 'dark'` | Actual rendered theme — always resolved |
| `setTheme` | `(theme) => void` | Update the theme |

### Force a specific theme

```tsx
// Always dark, no persistence
<DSNProvider theme="dark">
  <Card>Always dark card</Card>
</DSNProvider>

// Scoped to a section (no document sync)
<DSNProvider theme="dark" syncDocument={false}>
  <Card>Dark section only</Card>
</DSNProvider>
```

---

## Next.js Setup

No extra setup required. Just import and use.

```tsx
// app/page.tsx or pages/index.tsx
import { Button } from 'dosieungon-ui';

export default function Page() {
  return <Button>Hello</Button>;
}
```

For interactive components (Modal, Select, Drawer, etc.) in App Router, add `'use client'`:

```tsx
'use client';

import { useState } from 'react';
import { Modal, Button } from 'dosieungon-ui';

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
