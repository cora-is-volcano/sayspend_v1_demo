# VIBE CHECK — SaySpend UI Specification

> Design language for SaySpend, a voice-first bookkeeping app.
> Derived from reference UI screenshots. Warm, minimal, card-driven mobile-first aesthetic.
> Target: iOS (primary) / Android (follow-up) — MVP V1.0, March 2026.

---

## 1. Design Philosophy

- **Warm minimalism** — generous whitespace, soft neutral backgrounds, no visual clutter
- **Card-centric layout** — every content block lives in a rounded card
- **Friendly & approachable** — rounded shapes, soft shadows, emoji/icons as visual anchors
- **Bottom-sheet-first interactions** — modals slide up from the bottom, never full-page takeovers
- **Voice-forward** — press-and-hold mic as primary CTA; goal is ≤15s per multi-item session
- **Trust & control** — low-confidence fields are visually flagged; user always confirms before save
- **Zero-friction fallback** — manual add is always accessible when voice isn't convenient

---

## 2. Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#F5F0EB` | App background (warm cream) |
| `--bg-secondary` | `#FFFFFF` | Card backgrounds |
| `--bg-dark` | `#1C1C1E` | Dark header card / overlay |
| `--accent-primary` | `#E8F5A3` | CTA buttons, active chips (yellow-green) |
| `--accent-primary-hover` | `#D4E288` | CTA hover/pressed state |
| `--text-primary` | `#1C1C1E` | Headings, body text |
| `--text-secondary` | `#8E8E93` | Subtitles, labels, timestamps |
| `--text-on-dark` | `#FFFFFF` | Text on dark backgrounds |
| `--status-complete` | `#34C759` | Success / complete checkmarks |
| `--status-pending` | `#FF9500` | Pending / upcoming badges |
| `--chip-pink` | `#FFE5E5` | Category chip variant |
| `--chip-lavender` | `#EDE5FF` | Category chip variant |
| `--chip-mint` | `#E5F5E5` | Category chip variant |
| `--border-light` | `#E5E5EA` | Input borders, dividers |

---

## 3. Typography

| Style | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| **Display / Greeting** | Inter | 28px | 700 | 1.2 |
| **Section Title** | Inter | 20px | 600 | 1.3 |
| **Card Title** | Inter | 16px | 600 | 1.4 |
| **Body** | Inter | 14px | 400 | 1.5 |
| **Caption / Label** | Inter | 12px | 500 | 1.4 |
| **Amount (large)** | SF Mono / monospace | 24px | 600 | 1.2 |
| **Date (day number)** | Inter | 28px | 700 | 1.1 |
| **Date (month label)** | Inter | 12px | 500 | 1.2 |

---

## 4. Spacing & Layout

| Token | Value |
|---|---|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `32px` |
| `--space-2xl` | `48px` |
| `--page-padding` | `20px` |
| `--card-gap` | `12px` |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Input fields, small chips |
| `--radius-md` | `12px` | Cards, bottom sheet items |
| `--radius-lg` | `16px` | Large cards, modals |
| `--radius-xl` | `24px` | Bottom sheet handle area |
| `--radius-pill` | `9999px` | Chips, tags, nav pills |
| `--radius-circle` | `50%` | Avatars, icon buttons |

---

## 6. Shadows & Elevation

```
--shadow-card:    0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-sheet:   0 -4px 24px rgba(0, 0, 0, 0.08);
--shadow-fab:     0 4px 16px rgba(0, 0, 0, 0.12);
--shadow-pressed: 0 1px 4px rgba(0, 0, 0, 0.06);
```

---

## 7. Core Components

### 7.1 Transaction Cards

- Background: `--bg-secondary`
- Border radius: `--radius-lg` (16px)
- Padding: `--space-md` (16px)
- Shadow: `--shadow-card`
- Content layout: flexbox row, items centered
- Left: category icon (emoji) in a tinted circle
- Center: merchant/note (Card Title) + category label (Caption) + date (Caption)
- Right: amount (Amount style), color-coded by type:
  - Expense: `--text-primary` (default)
  - Income: `--status-complete` (green)
  - Transfer: `--text-secondary` (gray)
- Optional right action (chevron `>`, edit icon)

**Dark Card (featured/pinned):**
- Background: `--bg-dark`
- Text: `--text-on-dark`
- Used for top pinned / active item

**Low-Confidence Card (Review screen):**
- Left border: `3px solid --status-pending` (orange)
- Uncertain fields shown with dashed underline + ⚠️ icon
- Tapping the field opens inline edit

### 7.2 Bottom Sheet Modal

- Backdrop: `rgba(0, 0, 0, 0.3)`
- Background: `--bg-secondary`
- Border radius: `--radius-xl` top-left/right, 0 bottom
- Handle bar: `40px × 4px`, centered, `--border-light`, `--radius-pill`
- Close button: top-right, circle with `×`
- Max height: `90vh`, scrollable content
- Animation: slide up 300ms ease-out

### 7.3 Chips / Tags

- Padding: `6px 14px`
- Border radius: `--radius-pill`
- Font: Caption (12px / 500)
- **Unselected**: `--bg-secondary` bg, `--border-light` border, `--text-primary` text
- **Selected**: `--accent-primary` bg, no border, `--text-primary` text, optional `×` dismiss icon
- Leading icon: 16px, inline with text
- Gap between icon and text: `--space-xs`

**Transaction Type Chips** (used in filters & manual add):
- `Expense` / `Income` / `Transfer`
- Single-select, same chip styling

**Filter Chips** (History screen top bar):
- Category, type, merchant — horizontally scrollable
- Active filter shows count badge on "Filters" button

### 7.4 Buttons

**Primary CTA:**
- Background: `--accent-primary` (yellow-green)
- Text: `--text-primary`, 16px / 600
- Padding: `14px 24px`
- Border radius: `--radius-md`
- Full-width in bottom sheets
- Hover: `--accent-primary-hover`

**Secondary / Reset:**
- Background: `--bg-secondary`
- Border: `1px solid --border-light`
- Same sizing as primary

**FAB (Voice Record — Press & Hold):**
- Size: `56px` circle (idle), expands to `72px` when held
- Background: `--accent-primary` (idle), animated gradient ring when recording
- Shadow: `--shadow-fab`
- Icon: mic `24px` centered
- Position: center of bottom nav, elevated
- States:
  - **Idle**: static mic icon
  - **Pressed/Recording**: scale up, pulsing ring, waveform overlay
  - **Processing**: spinner replaces mic icon
  - **Release → Result**: bottom sheet slides up with parsed items

### 7.5 Input Fields

- Background: `--bg-secondary`
- Border: `1px solid --border-light`
- Border radius: `--radius-sm`
- Padding: `12px 16px`
- Font: Body (14px)
- Placeholder: `--text-secondary`
- Focus border: `--text-primary`

### 7.6 Number Pad

- Grid: 3 columns, 4 rows + bottom row (`.`, `0`, `⌫`)
- Button size: fill column, `48px` height
- Background: `#F5F5F0` (slightly warm off-white)
- Border radius: `--radius-sm`
- Font: 20px / 500
- Active/pressed: `--accent-primary` bg

### 7.7 Calendar Strip (Week View)

- Horizontal scroll, 7-day range
- Day label: Caption style, `--text-secondary`
- Date number: Body / 600
- **Today / selected**: circle bg `--text-primary`, text `--text-on-dark`
- Unselected: transparent bg

### 7.8 Bottom Navigation Bar

- Background: `--bg-dark` or frosted glass
- Border radius: `--radius-pill` (pill-shaped bar)
- Padding: `8px 16px`
- Position: fixed bottom, centered, floating
- Items: 4–5 icons, evenly spaced
- Active icon: filled / highlighted
- Inactive icon: outline, `--text-secondary`
- Center item can be elevated FAB

---

## 8. Category Icons

Each bookkeeping category gets a leading icon (use emoji or icon font):

| Category | Icon |
|---|---|
| Food & Dining | 🍽️ |
| Shopping | 🛍️ |
| Gift | 🎁 |
| Education | 📚 |
| Exchange | 💱 |
| Gaming | 🎮 |
| Daily Essentials | 🏠 |
| Sports | ⚽ |
| Setup | 🔧 |
| Transport | 🚗 |
| Entertainment | 🎬 |
| Health | 💊 |
| Others | 📦 |

---

## 9. Animation & Transitions

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Bottom sheet open | `translateY(100%) → 0` | 300ms | `ease-out` |
| Bottom sheet close | `translateY(0) → 100%` | 250ms | `ease-in` |
| Card press | `scale(0.98)` | 100ms | `ease` |
| Card release | `scale(1)` | 150ms | `ease` |
| Chip select | `bg-color transition` | 200ms | `ease` |
| Page transition | `opacity + translateX` | 250ms | `ease-in-out` |
| Voice pulse | `scale(1) → scale(1.15)` loop | 1000ms | `ease-in-out` |

---

## 10. Voice Input UX (Core Flow)

Press-and-hold → multi-item extraction → review → save.

### States

| State | Visual | Duration |
|---|---|---|
| **Idle** | FAB with mic icon, resting in bottom nav | — |
| **Recording** | FAB expands + pulse ring, live transcript overlay on screen | User holds |
| **Processing** | Spinner in FAB, transcript fades to "Parsing…" | 1–3s |
| **Result** | Review bottom sheet slides up with parsed items list | Until user acts |

### Live Transcript Overlay

- Position: above the FAB, floating card with `--bg-dark` + `--text-on-dark`
- Shows real-time speech-to-text
- Waveform bar below text (amplitude visualization)
- Auto-scrolls as user speaks

### Review Bottom Sheet (post-voice)

- Title: "Detected X items" (count badge)
- Each item: amount + category chip + merchant/note + date
- **Low-confidence fields**: dashed underline + ⚠️, tap to edit inline
- Actions:
  - **Save All** — primary CTA, full-width `--accent-primary`
  - **Edit** — tap any item → expands inline or opens Transaction Detail bottom sheet
  - **Discard** — text button, `--text-secondary`, with confirmation dialog
- If all items look good: one-tap save in ≤15s total

### Error & Fallback

- **Transcription failed**: toast "Couldn't catch that — try again" + retry button
- **No items parsed**: show transcript + "We couldn't find transactions. Try saying something like 'Coffee $4.50 and lunch $12'."
- **Partial parse**: show what was detected, flag missing fields as low-confidence

---

## 11. Screen Inventory

### P0 — MVP

| Screen | Tab | Description |
|---|---|---|
| **Home (Voice Agent)** | Home | Greeting, today's summary card, recent transactions, press-and-hold voice FAB, live transcript overlay |
| **Review & Edit** | — (modal) | Bottom sheet after voice: parsed items list, low-confidence highlights, Save All / Edit / Discard |
| **History** | History | Calendar strip (week view) + daily transaction list, filter chip bar, search |
| **Transaction Detail** | — (push) | Full-field view & edit: amount, type, category, merchant, date, location, payment method, note. Save / Delete |
| **Manual Add** | — (modal) | Quick form bottom sheet: amount → type → category → date → merchant/note. "Recent" shortcuts |
| **Filters** | — (modal) | Bottom sheet: type chips, category chips, currency, date range, Reset / Apply |

### P1 — Post-MVP

| Screen | Tab | Description |
|---|---|---|
| **Insights** | Insights | Monthly/weekly report, category pie chart, spending trends, income vs expense |
| **Goals** | Goals | Budget creation ("save $2000 this month"), progress bar, pace suggestions |
| **Guidance** | — (push) | Actionable saving tips, per-category limits (non-UGC) |
| **Settings** | Profile | Currency pref, voice language, category management, data export, privacy |
| **Receipt Scan** | — (modal) | Camera → OCR → auto-fill transaction (optional) |

### Bottom Nav Tabs

| Position | Icon | Label | Screen |
|---|---|---|---|
| 1 | 🏠 | Home | Home (Voice Agent) |
| 2 | 📊 | Insights | Insights (P1) |
| **Center** | 🎙️ | — | Voice FAB (press & hold) |
| 3 | 📅 | History | History |
| 4 | 👤 | Profile | Settings |

---

## 12. Responsive Breakpoints

This is a **mobile-first** app. Web preview is secondary.

| Breakpoint | Max Width | Notes |
|---|---|---|
| Mobile | `428px` | Primary target, full experience |
| Tablet | `768px` | Centered content, max-width container |
| Desktop | `1024px+` | Phone-frame preview or side-by-side panels |

---

## 13. Accessibility

- All interactive elements: min tap target `44px × 44px`
- Color contrast: WCAG AA minimum (4.5:1 for body text)
- Voice input: visual + haptic feedback for state changes
- Chip selections: `aria-pressed` toggle state
- Bottom sheet: focus trap when open, `Escape` to close
