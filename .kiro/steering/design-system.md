# CISL Core — Design System Rules

Always follow these rules when writing or editing UI code in this project.

## Color palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | #004E38 | Nav background, section headers |
| `cta` | #75AF0F | Primary buttons, active states, links |
| `cta-hover` | #5C8A0C | CTA hover |
| `cta-active` | #4A700A | CTA pressed / clicked |
| `gold` | #C7A034 | Decorative icons and dividers **only** |
| `background` | #FFFFFF | Page canvas |
| `foreground` | #2B2B29 | Body text, headings |
| `muted-foreground` | #6B6A63 | Captions, meta, placeholders |
| `border` | #DAD7CB | Standard borders and separators |

Never use raw hex values or Tailwind default colors (gray-*, zinc-*, etc.).
Always use the `--color-*` tokens via Tailwind utilities (`text-primary`, `bg-cta`, etc.).

## Typography — always use `.t-*` classes

| Class | Size / Weight | Use for |
|---|---|---|
| `.t-display` | 36px / 700 | Hero numbers, large KPIs |
| `.t-title` | 24px / 600 | Page headings (h1) |
| `.t-heading` | 18px / 600 | Section headings (h2) |
| `.t-subheading` | 16px / 600 | Card / panel titles (h3) |
| `.t-body` | 14px / 400 | Default body copy |
| `.t-body-med` | 14px / 500 | Emphasized text, names |
| `.t-body-semi` | 14px / 600 | Bold body, labels |
| `.t-sm` | 13px / 400 | Secondary text |
| `.t-caption` | 12px / 400 | Timestamps, meta |
| `.t-label` | 11px / 600 uppercase | Column headers, field labels |

Never use raw `text-sm`, `text-xs`, `font-semibold`, etc. for typography — always prefer the `.t-*` classes.

## Component library — always import from `components/ui`

```ts
import { Button, Badge, Card, CardHeader, CardBody, Alert, Input, Avatar, StatTile, PageShell, PageHeader, TableGrid, Th, Td } from "../components/ui";
```

### Button
- `variant`: `primary` (cta green) | `secondary` (bordered) | `ghost` | `danger`
- `size`: `sm` (h-8) | `md` (h-9, default) | `lg` (h-11)
- Always use `leftIcon` / `rightIcon` props for icons — never put icons as bare children alongside text

### Badge (replaces StatusBadge)
- `variant`: `success` | `warn` | `pending` | `danger` | `info` | `neutral` | `primary`
- Use `dot` prop for simple status indicators

### Card
- Use `<Card>` + `<CardHeader>` + `<CardBody>` for all bordered panel containers
- Never write `border border-border rounded-lg overflow-hidden` manually

### Alert
- Use for all inline callout banners
- `variant`: `info` | `success` | `warn` | `danger`
- Never write `bg-warn-bg text-warn-fg` panel divs manually

### Input
- Always use `<Input>` for text fields — never bare `<input>` elements
- Use `leftSlot` / `rightSlot` for icons or inline buttons

### Table
- Use `<TableGrid>`, `<TableGridRow cols={...}>`, `<Th>`, `<Td>` for all data tables
- Never write grid table markup manually

### PageShell / PageHeader
- Every screen body must be wrapped in `<PageShell>`
- Use `<PageHeader title="…" meta="…" action={…} />` for top-of-page headings

### Avatar
- Use `<Avatar initials="…" size="md" shape="rounded|circle" color="primary|gold|cta|muted" />`
- Never write custom initials divs manually

### StatTile
- Use for all KPI / metric tiles

## Spacing conventions
- Page horizontal padding: `px-7` (enforced by `PageShell`)
- Page vertical padding: `py-6` (enforced by `PageShell`)
- Section gap: `gap-9` between sections within a page
- Card body padding: `px-4 py-4` (enforced by `CardBody`)
- Table row padding: `px-5` (enforced by `TableGridRow`)

## Icons
- Always use `lucide-react` at `size={15}` or `size={16}`, `strokeWidth={1.75}`
- Always add `aria-hidden="true"` to decorative icons
- Gold icons are decorative only — do not use `text-gold` on interactive elements

## Focus / accessibility
- All interactive elements must work with keyboard and have `:focus-visible` styles (provided globally)
- Add `aria-label` to icon-only buttons
- Use `role="tablist"` / `role="tab"` / `aria-selected` on tab bars
- Use `role="progressbar"` with `aria-valuenow` on progress bars
