# CISL Core — Design System

> Reference document for frontend developers. All UI work in this project must follow these guidelines.

---

## Table of Contents

1. [Stack & Setup](#1-stack--setup)
2. [Color Palette](#2-color-palette)
3. [Typography Scale](#3-typography-scale)
4. [Spacing & Layout](#4-spacing--layout)
5. [Radius & Shadow Scale](#5-radius--shadow-scale)
6. [Component Library](#6-component-library)
   - [Button](#button)
   - [Badge](#badge)
   - [Input](#input)
   - [Toggle](#toggle)
   - [Card](#card)
   - [Alert](#alert)
   - [Modal](#modal)
   - [Table](#table)
   - [Avatar](#avatar)
   - [StatTile](#stattile)
   - [PageShell & PageHeader](#pageshell--pageheader)
   - [TopBar](#topbar)
   - [StepperBar](#stepperbar)
   - [Separator](#separator)
7. [Patterns](#7-patterns)
   - [Field & ReviewField](#field--reviewfield)
   - [Form Controls](#form-controls)
   - [Tab Bars](#tab-bars)
   - [Row Action Menu](#row-action-menu)
   - [Success Modal with Confetti](#success-modal-with-confetti)
8. [Icons](#8-icons)
9. [Accessibility](#9-accessibility)
10. [Do & Don't](#10-do--dont)

---

## 1. Stack & Setup

| Tool | Version |
|---|---|
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | v4 (Vite plugin) |
| Icons | lucide-react |
| Router | react-router-dom v7 |

### Tailwind v4 Theme Setup

All design tokens live in `index.css` inside a `@theme {}` block. Tailwind v4 reads them automatically — no `tailwind.config.js` needed.

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Roboto", system-ui, -apple-system, sans-serif;

  /* Brand */
  --color-primary:      #004E38;
  --color-primary-dark: #003A29;
  --color-cta:          #75AF0F;
  --color-cta-hover:    #5C8A0C;
  --color-cta-active:   #4A700A;
  --color-gold:         #C7A034;

  /* Surfaces */
  --color-background:   #FFFFFF;
  --color-card:         #FFFFFF;
  --color-muted:        #F5F4EF;
  --color-panel:        #F0EEE7;

  /* Text */
  --color-foreground:        #2B2B29;
  --color-muted-foreground:  #6B6A63;

  /* Borders */
  --color-border:       #DAD7CB;
  --color-border-light: #EDEBE3;

  /* Nav */
  --color-nav-muted:  #B9D2C6;
  --color-nav-active: #01402C;

  /* Status */
  --color-success-bg: #EDF5DC;  --color-success-fg: #4A6B0C;
  --color-warn-bg:    #F7EFD4;  --color-warn-fg:    #8A6D12;
  --color-pending-bg: #F7E4D4;  --color-pending-fg: #9A5B12;
  --color-danger-bg:  #FDECEA;  --color-danger-fg:  #9B1C1C;
  --color-info-bg:    #E7EFF7;  --color-info-fg:    #2C5F8A;

  /* Radius */
  --radius-xs: 4px;   --radius-sm: 6px;   --radius-md: 8px;
  --radius-lg: 10px;  --radius-xl: 14px;  --radius-2xl: 20px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.14), 0 8px 16px rgba(0,0,0,0.08);
}
```

### Typography CSS Classes

Add these to your `index.css` after the `@theme` block:

```css
.t-display    { font-size: 2.25rem;   line-height: 1.15; font-weight: 700; letter-spacing: -0.02em; }
.t-title      { font-size: 1.5rem;    line-height: 1.25; font-weight: 600; letter-spacing: -0.015em; }
.t-heading    { font-size: 1.125rem;  line-height: 1.35; font-weight: 600; letter-spacing: -0.01em; }
.t-subheading { font-size: 1rem;      line-height: 1.4;  font-weight: 600; }
.t-body       { font-size: 0.875rem;  line-height: 1.5;  font-weight: 400; }
.t-body-med   { font-size: 0.875rem;  line-height: 1.5;  font-weight: 500; }
.t-body-semi  { font-size: 0.875rem;  line-height: 1.5;  font-weight: 600; }
.t-sm         { font-size: 0.8125rem; line-height: 1.5;  font-weight: 400; }
.t-caption    { font-size: 0.75rem;   line-height: 1.5;  font-weight: 400; }
.t-label      { font-size: 0.6875rem; line-height: 1.4;  font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
```

### Component Barrel Import

All UI primitives live in `components/ui/`. Always import from the barrel:

```ts
import { Button, Badge, Card, CardHeader, CardBody, Alert, Input,
         Toggle, Avatar, StatTile, PageShell, PageHeader, Modal,
         ModalHeader, ModalBody, ModalFooter, TableGrid, Th, Td
} from "../components/ui";
```

---

## 2. Color Palette

### Brand

| Token | Tailwind class | Hex | Usage |
|---|---|---|---|
| `primary` | `bg-primary` / `text-primary` | `#004E38` | Sidebar, nav background |
| `primary-dark` | `bg-primary-dark` | `#003A29` | Pressed nav states |
| `cta` | `bg-cta` / `text-cta` | `#75AF0F` | Primary buttons, active links |
| `cta-hover` | `hover:bg-cta-hover` | `#5C8A0C` | CTA hover state |
| `cta-active` | `active:bg-cta-active` | `#4A700A` | CTA pressed / click state |
| `gold` | `text-gold` | `#C7A034` | Decorative icons only — never interactive |

### Surfaces

| Token | Hex | Usage |
|---|---|---|
| `background` | `#FFFFFF` | Page canvas |
| `card` | `#FFFFFF` | Card and modal surfaces |
| `muted` | `#F5F4EF` | Table headers, row hover fill |
| `panel` | `#F0EEE7` | Inset panels, avatar backgrounds |

### Text

| Token | Hex | Usage |
|---|---|---|
| `foreground` | `#2B2B29` | All headings and body copy |
| `muted-foreground` | `#6B6A63` | Captions, meta, placeholders |

### Borders

| Token | Hex | Usage |
|---|---|---|
| `border` | `#DAD7CB` | All standard borders and lines |
| `border-light` | `#EDEBE3` | Subtle row dividers inside tables |

### Semantic Status

| Variant | Background | Foreground |
|---|---|---|
| Success | `bg-success-bg` `#EDF5DC` | `text-success-fg` `#4A6B0C` |
| Warning | `bg-warn-bg` `#F7EFD4` | `text-warn-fg` `#8A6D12` |
| Pending | `bg-pending-bg` `#F7E4D4` | `text-pending-fg` `#9A5B12` |
| Danger | `bg-danger-bg` `#FDECEA` | `text-danger-fg` `#9B1C1C` |
| Info | `bg-info-bg` `#E7EFF7` | `text-info-fg` `#2C5F8A` |

> **Rule:** Never use raw hex values or Tailwind default colors (`gray-*`, `zinc-*`, etc.). Always use the tokens above.

---

## 3. Typography Scale

Use the `.t-*` utility classes for all text. Never use raw `text-sm`, `font-semibold`, etc.

| Class | Size | Weight | Use for |
|---|---|---|---|
| `.t-display` | 36px | 700 | Hero numbers, large KPIs |
| `.t-title` | 24px | 600 | Page headings `<h1>` |
| `.t-heading` | 18px | 600 | Section headings `<h2>` |
| `.t-subheading` | 16px | 600 | Card / panel titles `<h3>` |
| `.t-body` | 14px | 400 | Default body copy |
| `.t-body-med` | 14px | 500 | Emphasized text, names |
| `.t-body-semi` | 14px | 600 | Bold body, table cell labels |
| `.t-sm` | 13px | 400 | Secondary text |
| `.t-caption` | 12px | 400 | Timestamps, metadata |
| `.t-label` | 11px | 600 uppercase | Column headers, form field labels |

Font family: **Roboto** (400, 500, 600, 700) loaded from Google Fonts.

---

## 4. Spacing & Layout

| Context | Value | How enforced |
|---|---|---|
| Page horizontal padding | `px-7` (28px) | `PageShell` component |
| Page vertical padding | `py-6` (24px) | `PageShell` component |
| Card body padding | `px-4 py-4` | `CardBody` component |
| Table row padding | `px-5` | `TableGridRow` component |
| Section gap (within page) | `gap-9` | Applied manually |
| Field grid gap | `gap-x-8 gap-y-6` | Applied in field card pattern |

---

## 5. Radius & Shadow Scale

### Border Radius

| Token | Value | Use for |
|---|---|---|
| `radius-xs` | 4px | Badges, chips |
| `radius-sm` | 6px | Focus rings, small inputs |
| `radius-md` | 8px | Buttons, inputs, dropdowns |
| `radius-lg` | 10px | Cards, panels |
| `radius-xl` | 14px | Avatar rounded shape |
| `radius-2xl` | 20px | Large modals, hero cards |
| `radius-full` | 9999px | Circular avatars, pill badges |

### Shadows

| Token | Use for |
|---|---|
| `shadow-xs` | Subtle card lift |
| `shadow-sm` | Default card shadow |
| `shadow-md` | Dropdowns, popovers |
| `shadow-lg` | Modals, dialogs |
| `shadow-xl` | Full-screen overlays |

---

## 6. Component Library

### Button

```tsx
<Button variant="primary" size="md" leftIcon={<Plus size={15} />}>
  Add customer
</Button>
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `primary \| secondary \| ghost \| danger` | `secondary` | Visual style |
| `size` | `sm \| md \| lg` | `md` | Height and padding |
| `leftIcon` | `ReactNode` | — | Icon before label |
| `rightIcon` | `ReactNode` | — | Icon after label |
| `loading` | `boolean` | `false` | Shows spinner, disables button |
| `disabled` | `boolean` | `false` | Standard disabled state |

**Variants**

| Variant | Background | Use when |
|---|---|---|
| `primary` | Lime `#75AF0F` | Main CTA — one per section max |
| `secondary` | White + border | Secondary actions |
| `ghost` | Transparent | Inline or table row actions |
| `danger` | Red tint | Destructive actions |

**Sizes**

| Size | Height | Use when |
|---|---|---|
| `sm` | 32px | Table actions, compact toolbars |
| `md` | 36px | Standard page actions |
| `lg` | 44px | Hero / form submit buttons |

> **Rule:** Always use `leftIcon` / `rightIcon` props for icons. Never put icon + text as raw children.

---

### Badge

```tsx
<Badge variant="success">KYC Verified</Badge>
<Badge variant="warn" dot>PEP</Badge>
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `success \| warn \| pending \| danger \| info \| neutral \| primary` | `neutral` | Color style |
| `dot` | `boolean` | `false` | Adds a colored dot before content |

---

### Input

```tsx
<Input
  label="Account number"
  placeholder="e.g. CL00385"
  leftSlot={<Search size={16} />}
  hint="Enter the full account number"
  error="Account not found"
/>
```

**Props**

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Field label — auto-links to input via `htmlFor` |
| `hint` | `string` | Supporting text below the field |
| `error` | `string` | Error message — renders in red, sets `aria-invalid` |
| `leftSlot` | `ReactNode` | Icon or element on the left inside the input |
| `rightSlot` | `ReactNode` | Icon, button, or element on the right inside the input |

> **Rule:** Never use a raw `<input>` element. Always use `<Input>`.

---

### Toggle

An accessible boolean switch for settings and feature flags.

```tsx
<Toggle
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Enable notifications"
  description="Receive alerts when accounts are updated"
/>
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | — | Controlled value |
| `onChange` | `(v: boolean) => void` | — | Called when toggled |
| `label` | `string` | — | Text label to the left of the switch |
| `description` | `string` | — | Optional subtext below the label |
| `disabled` | `boolean` | `false` | Dims and prevents interaction |

**Accessibility:** Uses `role="switch"` and `aria-checked`. The entire label is clickable.

---

### Card

```tsx
<Card>
  <CardHeader
    icon={<Landmark size={15} className="text-gold" />}
    title="Investment Accounts"
    action={<Button size="sm">View all</Button>}
  />
  <CardBody>
    …content…
  </CardBody>
</Card>
```

**CardHeader Props**

| Prop | Type | Description |
|---|---|---|
| `title` | `ReactNode` | Card title |
| `icon` | `ReactNode` | Optional icon before the title |
| `description` | `string` | Optional subtitle |
| `action` | `ReactNode` | Right-side element (button, link) |

> **Rule:** Never write `border border-border rounded-lg overflow-hidden` manually. Always use `<Card>`.

---

### Alert

```tsx
<Alert variant="warn" title="PEP Flagged">
  Enhanced due diligence applies to this customer.
</Alert>
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `info \| success \| warn \| danger` | `info` | Color and icon |
| `title` | `string` | — | Optional bold heading |

> **Rule:** Never write `bg-warn-bg text-warn-fg` callout divs manually. Always use `<Alert>`.

---

### Modal

```tsx
<Modal open={open} onClose={() => setOpen(false)} size="xl">
  <ModalHeader
    title="Customer Profile"
    description="CIF 000001 · Onboarded 18 May 2022"
    adornment={<Avatar initials="MN" size="md" shape="rounded" />}
    actions={<Button variant="secondary" size="sm">Edit</Button>}
    onClose={() => setOpen(false)}
  />
  <ModalTabBar>
    <ModalTab active={tab === "details"} onClick={() => setTab("details")}>
      Details
    </ModalTab>
    <ModalTab active={tab === "docs"} onClick={() => setTab("docs")} badge={3}>
      Documents
    </ModalTab>
  </ModalTabBar>
  <ModalBody flush>
    <div className="px-6 py-5">…content…</div>
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
  </ModalFooter>
</Modal>
```

**Modal Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controls visibility |
| `onClose` | `() => void` | — | Called on Escape or backdrop click |
| `size` | `sm \| md \| lg \| xl \| full` | `md` | Max width preset |
| `disableBackdropClose` | `boolean` | `false` | Prevents closing on backdrop click |

**Sizes**

| Size | Max width | Use for |
|---|---|---|
| `sm` | 448px | Confirmations, simple forms |
| `md` | 576px | Standard dialogs |
| `lg` | 768px | Medium content |
| `xl` | 1024px | Detail views with tabs |
| `full` | 100vw − 64px | Full canvas experiences |

**Behaviour built in:** `Escape` closes, body scroll locked, focus moved into panel on open, rendered via `createPortal`.

**`ModalBody flush`** — pass `flush` when the content manages its own padding (e.g. when using tab bars with sections). Without `flush`, default `px-6 py-5` padding is applied.

---

### Table

Grid-based CSS table — uses `display: grid` per row, not `<table>`.

```tsx
const COLS = "2fr 1.4fr 1fr 120px";

<TableGrid>
  <TableHead>
    <TableGridRow cols={COLS} head>
      <Th sort={sortKey === "name" ? sortDir : null} onSort={() => toggleSort("name")}>
        Customer
      </Th>
      <Th>ID</Th>
      <Th>Onboarded</Th>
      <Th />
    </TableGridRow>
  </TableHead>
  <TableBody>
    {rows.length === 0 ? (
      <TableEmpty>No results found.</TableEmpty>
    ) : rows.map(r => (
      <TableGridRow key={r.id} cols={COLS}>
        <div className="flex flex-col gap-0.5">
          <span className="t-body-med">{r.name}</span>
          <span className="t-caption text-muted-foreground">CIF {r.cif}</span>
        </div>
        <Td muted>{r.id}</Td>
        <Td muted>{r.date}</Td>
        <div className="flex justify-end">
          <Button variant="ghost" size="sm">View</Button>
        </div>
      </TableGridRow>
    ))}
  </TableBody>
</TableGrid>
```

**TableGridRow Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `cols` | `string` | — | CSS `grid-template-columns` value |
| `head` | `boolean` | `false` | Renders as muted header row |

**Th Props**

| Prop | Type | Description |
|---|---|---|
| `sort` | `"asc" \| "desc" \| null` | Shows sort arrow indicator |
| `onSort` | `() => void` | Called when header is clicked |
| `align` | `left \| center \| right` | Text alignment |

**Td Props**

| Prop | Type | Description |
|---|---|---|
| `muted` | `boolean` | Uses `muted-foreground` color |
| `align` | `left \| center \| right` | Text alignment |

---

### Avatar

```tsx
<Avatar initials="MN" size="lg" shape="rounded" color="primary" />
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `initials` | `string` | — | 1–2 characters |
| `size` | `xs \| sm \| md \| lg \| xl` | `md` | 24 / 32 / 40 / 48 / 64px |
| `shape` | `circle \| rounded` | `circle` | Border radius style |
| `color` | `primary \| gold \| cta \| muted` | `primary` | Background color |

> **Rule:** Never write a custom initials `<div>` manually. Always use `<Avatar>`.

---

### StatTile

```tsx
<div className="grid grid-cols-4 gap-3.5">
  <StatTile label="Total portfolio value" value="KES 48,250,000" />
  <StatTile label="Available cash" value="KES 3,120,400" sub="As of today" />
</div>
```

**Props**

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Caption above the value |
| `value` | `ReactNode` | Primary metric |
| `sub` | `ReactNode` | Optional supporting text below |
| `adornment` | `ReactNode` | Optional icon in top-right corner |

---

### PageShell & PageHeader

Every screen body must be wrapped in `<PageShell>`.

```tsx
<>
  <TopBar crumbs={[{ label: "Account Maintenance" }, { label: "Customers" }]} />
  <PageShell>
    <PageHeader
      title="Customers"
      meta="37,403 total · 128 flagged for review"
      action={<Button leftIcon={<Download size={15} />}>Export</Button>}
    />
    …page content…
  </PageShell>
</>
```

**PageHeader Props**

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Page heading — renders as `t-title` |
| `meta` | `string` | Subtext below the title |
| `action` | `ReactNode` | Right-side CTA (usually a primary Button) |

---

### TopBar

Breadcrumb navigation bar that sits above every page. Always the first element inside the screen component, before `<PageShell>`.

```tsx
<TopBar
  crumbs={[
    { label: "Account Maintenance" },
    { label: "Customers", to: "/customers" },
    { label: "Margaret Muiruri" },
  ]}
/>
```

**Crumb object**

| Field | Type | Description |
|---|---|---|
| `label` | `string` | Display text |
| `to` | `string` (optional) | If provided, renders as a link |

- Last crumb is always rendered bold and non-linked (current page)
- Intermediate crumbs with `to` render as lime links
- Intermediate crumbs without `to` render in muted color

---

### StepperBar

Horizontal step progress indicator for multi-step flows.

```tsx
import { StepperBar } from "../components/onboarding/StepperBar";

const STEPS = [
  { key: "personal",   label: "Basic"      },
  { key: "details",    label: "Details"    },
  { key: "compliance", label: "Compliance" },
  { key: "account",    label: "Account"    },
  { key: "review",     label: "Review"     },
];

<StepperBar steps={STEPS} current={2} /> {/* 0-indexed — shows step 3 active */}
```

**Props**

| Prop | Type | Description |
|---|---|---|
| `steps` | `{ key: string; label: string }[]` | Ordered step definitions |
| `current` | `number` | 0-indexed active step |

**Visual states:**
- **Done** (index < current) — green fill with checkmark
- **Active** (index === current) — primary green fill with ring
- **Future** (index > current) — muted with border

Connectors between steps fill green as steps are completed.

---

### Separator

```tsx
<Separator />                                        {/* horizontal line */}
<Separator orientation="vertical" className="h-4" /> {/* vertical rule */}
<Separator decorative />                             {/* gold accent line */}
```

---

## 7. Patterns

### Field & ReviewField

Two variants of the read-only key-value display pattern.

**`Field`** — used in view modals and detail panels. Standard label weight.

```tsx
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>
        {label}
      </span>
      <span className="t-body text-foreground">{value ?? "—"}</span>
    </div>
  );
}
```

**`ReviewField`** — used specifically on review/confirmation screens before submission. Same label treatment as `Field`.

```tsx
function ReviewField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, color: "#A8A7A1" }}>
        {label}
      </span>
      <span className="t-body text-foreground">{value || "—"}</span>
    </div>
  );
}
```

**Label style rationale:** On read-only detail and review screens the label is intentionally lighter (`#A8A7A1`, weight 500) than on editable forms — it recedes so the value reads as the primary element. Do **not** apply this label style to editable form field labels, which use the standard `t-label text-muted-foreground` classes.

**Usage pattern in a card:**

```tsx
<Card>
  <CardHeader icon={<User size={15} strokeWidth={2} />} title="Personal Information" />
  <div className="px-5 py-5 grid grid-cols-4 gap-x-8 gap-y-5">
    <Field label="Full Name"   value={customer.firstName + " " + customer.lastName} />
    <Field label="ID Number"   value={customer.idNumber} />
    <Field label="Phone"       value={customer.phone} />
    <Field label="Email"       value={customer.email} />
  </div>
</Card>
```

---

### Form Controls

For `<select>` and `<textarea>` elements not covered by `<Input>`, use these consistent class strings:

**Select**
```tsx
<select
  value={value}
  onChange={(e) => onChange(e.target.value)}
  className="h-11 rounded-md border border-border bg-background px-3.5 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors disabled:bg-muted disabled:cursor-not-allowed"
>
  <option value="">Select…</option>
  <option value="a">Option A</option>
</select>
```

**Textarea**
```tsx
<textarea
  value={value}
  onChange={(e) => onChange(e.target.value)}
  rows={3}
  className="w-full rounded-md border border-border bg-background px-3.5 py-3 t-body text-foreground focus:outline-none focus:border-cta focus:ring-2 focus:ring-cta/20 hover:border-muted-foreground transition-colors resize-none disabled:bg-muted disabled:cursor-not-allowed"
/>
```

**Radio group** (e.g. signing instructions, option selection)
```tsx
{options.map((opt) => (
  <label key={opt.value}
    className={`flex items-start gap-3 px-4 py-3.5 rounded-lg border cursor-pointer transition-colors
      ${value === opt.value ? "border-cta bg-cta/5" : "border-border hover:border-cta/40"}`}
  >
    <input type="radio" name="group-name" value={opt.value}
      checked={value === opt.value} onChange={() => setValue(opt.value)}
      className="mt-0.5 accent-cta shrink-0" />
    <div className="flex flex-col gap-0.5">
      <span className="t-body-semi">{opt.label}</span>
      <span className="t-caption text-muted-foreground">{opt.description}</span>
    </div>
  </label>
))}
```

**Checkbox**
```tsx
<label className="flex items-start gap-3 cursor-pointer">
  <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)}
    className="mt-0.5 accent-cta w-4 h-4 shrink-0" />
  <span className="t-body text-foreground">{label}</span>
</label>
```

---

### Tab Bars

Page-level tab bars (used on screens with multiple content views):

```tsx
<div className="flex gap-6 border-b border-border mb-5" role="tablist">
  {tabs.map((t) => (
    <button key={t.key} role="tab" aria-selected={active === t.key}
      onClick={() => setActive(t.key)}
      className={[
        "flex items-center gap-2 pb-3 -mb-px t-body border-b-2 transition-colors whitespace-nowrap",
        active === t.key
          ? "border-cta text-primary font-semibold"
          : "border-transparent text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {t.label}
      {t.count !== undefined && (
        <span className="t-caption bg-panel text-muted-foreground rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
          {t.count}
        </span>
      )}
    </button>
  ))}
</div>
```

Compact pill tabs (used inside modals or cards):

```tsx
<div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
  {tabs.map((t) => (
    <button key={t.key} type="button" onClick={() => setActive(t.key)}
      className={`px-4 py-1.5 rounded-md t-body-semi transition-colors
        ${active === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
      {t.label}
    </button>
  ))}
</div>
```

---

### Row Action Menu

A `⋯` overflow menu for table row actions. Build as a local component per screen:

```tsx
function RowMenu({ items }: {
  items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[]
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-center justify-end">
      <button
        aria-label="Actions" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta"
      >
        <MoreHorizontal size={16} strokeWidth={1.75} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 z-20 w-44 bg-card border border-border rounded-md py-1 shadow-lg">
          {items.map(item => (
            <button key={item.label} role="menuitem"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 t-body transition-colors text-left
                ${item.danger ? "text-danger-fg hover:bg-danger-bg" : "text-foreground hover:bg-muted"}`}
            >
              <span className={item.danger ? "text-danger-fg" : "text-muted-foreground"} aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Success Modal with Confetti

Used at the end of multi-step flows to celebrate completion before redirecting.

```tsx
function SuccessModal({ title, description, ctaLabel, onCta }: {
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  const COLORS = ["#75AF0F", "#004E38", "#C7A034", "#4B9FE1", "#E85D4A", "#F5C518"];
  return (
    <>
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden" aria-hidden="true">
        {Array.from({ length: 120 }).map((_, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <div key={i} style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: "-20px",
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              backgroundColor: color,
              borderRadius: i % 3 === 0 ? "50%" : "2px",
              animation: `confetti-fall ${2.2 + Math.random() * 1.5}s ${Math.random() * 1.2}s ease-in forwards`,
            }} />
          );
        })}
        <style>{`
          @keyframes confetti-fall {
            0%   { transform: translateY(0) rotate(0deg);      opacity: 1; }
            80%  { opacity: 1; }
            100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </div>
      {/* Modal */}
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-md bg-card rounded-2xl shadow-2xl flex flex-col items-center text-center px-8 py-10 gap-5">
          <div className="w-16 h-16 rounded-2xl bg-cta flex items-center justify-center">
            <CheckCircle2 size={32} strokeWidth={1.75} className="text-white" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="t-heading">{title}</h2>
            <p className="t-body text-muted-foreground">{description}</p>
          </div>
          <Button variant="primary" size="lg" className="w-full" onClick={onCta}
            rightIcon={<ChevronRight size={15} strokeWidth={1.75} />}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
```

---

## 8. Icons

All icons use **lucide-react**.

| Rule | Detail |
|---|---|
| Size | `size={15}` or `size={16}` — never larger in UI chrome |
| Stroke | `strokeWidth={1.75}` always |
| Decorative | Add `aria-hidden="true"` |
| Interactive | Add `aria-label` to icon-only buttons |
| Gold icons | `text-gold` for decorative section icons only — never on interactive elements |

```tsx
// ✅ Correct
<Download size={15} strokeWidth={1.75} aria-hidden="true" />

// ✅ Icon-only button
<button aria-label="Close"><X size={16} strokeWidth={1.75} /></button>
```

---

## 9. Accessibility

| Rule | Implementation |
|---|---|
| Focus ring | Global `:focus-visible` — 2px lime ring, 2px offset, `radius-sm` |
| Keyboard navigation | All interactive elements reachable and operable via keyboard |
| Tab bars | `role="tablist"`, `role="tab"`, `aria-selected` |
| Modals | `role="dialog"` `aria-modal="true"`, focus moves in on open, Escape closes |
| Toggle | `role="switch"`, `aria-checked` |
| Progress bars | `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Form inputs | `<Input>` auto-wires `htmlFor`, `aria-invalid`, `aria-describedby` |
| Disabled buttons | Use `disabled` attribute, not just visual opacity |

---

## 10. Do & Don't

### Colors
```
✅ <div className="bg-primary text-white">
❌ <div style={{ background: "#004E38" }}>
❌ <div className="bg-green-800 text-white">
```

### Typography
```
✅ <h1 className="t-title">Customers</h1>
❌ <h1 className="text-2xl font-semibold">Customers</h1>
```

### Buttons
```
✅ <Button variant="primary" leftIcon={<Plus size={15} />}>Add</Button>
❌ <button className="h-9 px-4 bg-cta text-white rounded-md">Add</button>
```

### Cards
```
✅ <Card><CardHeader title="Holdings" /></Card>
❌ <div className="border border-border rounded-lg overflow-hidden">…</div>
```

### Alerts
```
✅ <Alert variant="warn">Enhanced due diligence applies.</Alert>
❌ <div className="bg-warn-bg text-warn-fg rounded-md px-4 py-3">…</div>
```

### Tables
```
✅ <TableGrid><TableGridRow cols="1fr 1fr" head><Th>Name</Th></TableGridRow></TableGrid>
❌ <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>…</div>
```

### Avatars
```
✅ <Avatar initials="MN" size="lg" shape="rounded" />
❌ <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">MN</div>
```

### Read-only field labels (view/review screens only)
```
✅ <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 500, color: "#A8A7A1" }}>Label</span>
❌ <span className="t-label text-muted-foreground">Label</span>  {/* on review screens */}
```

### Form field labels (editable forms)
```
✅ <span className="t-label text-foreground">Label</span>
❌ <span style={{ color: "#A8A7A1" }}>Label</span>  {/* on form inputs */}
```

---

*Last updated: August 2026 — CISL Core v0.1*
