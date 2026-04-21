# EventSphere — Design System Master File

> **Version:** 1.0 — Generated 2026-04-21
> **Style:** Enterprise SaaS + Soft UI Evolution
> **Stack:** React 19 + TypeScript + React Bootstrap 5 + CSS Modules
> **Branch:** `ui-pro-max`

---

## 1. Design Direction

EventSphere serves 6 distinct professional roles (Admin, Organizer, Venue Manager, Finance Officer, Vendor, Attendee). The design targets *operators* of the platform — professionals spending hours in dashboards — and must feel like a serious, modern B2B tool (Linear / Notion / Loom aesthetic) while carrying event-industry energy through a warm accent color.

**Moving from:** Navy/Saffron consumer-event aesthetic
**Moving to:** Indigo/Amber enterprise SaaS with Soft UI Evolution

### Anti-Patterns to Avoid
- Gradient-heavy consumer aesthetics in dashboards (reserve gradients for marketing pages only)
- Hard-coded hex values in component files (use CSS tokens always)
- Text below `0.8125rem` (13px) for readable prose
- `color-only` status indicators (always pair color with icon or text)
- Generic gray box-shadows (use Indigo-tinted shadows for brand cohesion)

---

## 2. Color System

All colors defined as CSS custom properties on `:root` (light) and `[data-theme="dark"]`.

### 2.1 Brand Colors

| Token | Light Value | Dark Value | Role |
|-------|-------------|------------|------|
| `--color-primary` | `#4F46E5` | `#6366F1` | Indigo — primary actions, active nav, links |
| `--color-primary-hover` | `#4338CA` | `#818CF8` | Hover state for primary |
| `--color-primary-subtle` | `#EEF2FF` | `rgba(99,102,241,0.12)` | Tinted icon/badge backgrounds |
| `--color-primary-border` | `#C7D2FE` | `rgba(99,102,241,0.30)` | Subtle bordered elements |
| `--color-accent` | `#EA580C` | `#FB923C` | Warm CTA (replaces saffron #F47920) |
| `--color-accent-hover` | `#C2410C` | `#F97316` | Hover for accent |
| `--color-accent-subtle` | `#FFF7ED` | `rgba(234,88,12,0.12)` | Accent badge/icon backgrounds |
| `--color-accent-border` | `#FDBA74` | `rgba(234,88,12,0.30)` | Accent borders |

### 2.2 Semantic Status Colors

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `--color-success` | `#10B981` | `#34D399` |
| `--color-success-subtle` | `#ECFDF5` | `rgba(16,185,129,0.12)` |
| `--color-success-border` | `#A7F3D0` | `rgba(16,185,129,0.30)` |
| `--color-warning` | `#D97706` | `#FBBF24` |
| `--color-warning-subtle` | `#FFFBEB` | `rgba(217,119,6,0.12)` |
| `--color-warning-border` | `#FDE68A` | `rgba(217,119,6,0.30)` |
| `--color-danger` | `#DC2626` | `#F87171` |
| `--color-danger-subtle` | `#FEF2F2` | `rgba(220,38,38,0.12)` |
| `--color-danger-border` | `#FECACA` | `rgba(220,38,38,0.30)` |
| `--color-info` | `#0284C7` | `#38BDF8` |
| `--color-info-subtle` | `#F0F9FF` | `rgba(2,132,199,0.12)` |
| `--color-info-border` | `#BAE6FD` | `rgba(2,132,199,0.30)` |

### 2.3 Surfaces & Text

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `--color-bg` | `#F8FAFC` | `#0C0E14` |
| `--color-surface` | `#FFFFFF` | `#161923` |
| `--color-surface-raised` | `#FFFFFF` | `#1E2330` |
| `--color-bg-subtle` | `#F1F5F9` | `#111420` |
| `--color-bg-hover` | `#EEF2F7` | `#1C2030` |
| `--color-border` | `#E2E8F0` | `rgba(255,255,255,0.08)` |
| `--color-border-subtle` | `#F1F5F9` | `rgba(255,255,255,0.04)` |
| `--color-text-primary` | `#0F172A` | `#F1F5F9` |
| `--color-text-body` | `#334155` | `#CBD5E1` |
| `--color-text-secondary` | `#64748B` | `#94A3B8` |
| `--color-text-muted` | `#94A3B8` | `#475569` |

### 2.4 Shadow Scale (Indigo-tinted)

```css
--shadow-xs: 0 1px 2px rgba(79,70,229,0.04), 0 0 0 1px rgba(79,70,229,0.03);
--shadow-sm: 0 2px 6px rgba(79,70,229,0.06), 0 0 0 1px rgba(79,70,229,0.04);
--shadow-md: 0 4px 16px rgba(79,70,229,0.10), 0 0 0 1px rgba(79,70,229,0.06);
--shadow-lg: 0 8px 30px rgba(79,70,229,0.14), 0 0 0 1px rgba(79,70,229,0.08);
```

Dark mode: replace with border glow (no box-shadows on dark surfaces).

### 2.5 Gradient Tokens

```css
--gradient-primary: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
--gradient-hero:    linear-gradient(135deg, #312E81 0%, #4F46E5 60%, #6366F1 100%);
--gradient-accent:  linear-gradient(135deg, #EA580C 0%, #F97316 100%);
--gradient-subtle:  linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%);
```

---

## 3. Typography

### 3.1 Font Family

**Primary:** `Plus Jakarta Sans` (replaces Urbanist)
**Brand/Logo only:** `Playwrite IE` (retained for "event·sphere" wordmark)

```css
--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
```

```html
<!-- index.html preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style"
  href="https://fonts.googleapis.com/css2?family=Playwrite+IE:wght@100..400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap">
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Playwrite+IE:wght@100..400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap">
```

**Why Plus Jakarta Sans over Urbanist:**
- Weight range 200–800 vs 300–700: enables `800` ExtraBold for hero numerics
- Better optical sizing at 11–13px (labels, badges)
- Stronger geometric character — signals "modern B2B SaaS"

### 3.2 Type Scale

| Role | Size | Weight | Line-height | Letter-spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| Hero | `3rem` | `800` | `1.10` | `-0.02em` | Landing page H1 |
| Display | `2rem` | `700` | `1.20` | `-0.01em` | Section headings, page titles |
| Heading | `1.375rem` | `700` | `1.30` | `0` | Card/panel headings |
| Subheading | `1.0625rem` | `600` | `1.40` | `0` | Sub-sections |
| Body | `0.9375rem` | `400` | `1.60` | `0` | All prose |
| Small | `0.8125rem` | `400` | `1.50` | `0` | Secondary text, table cells |
| XS / Label | `0.6875rem` | `700` | `1.40` | `0.06em` | Badges, overlines, table headers |

### 3.3 Special Patterns

**Section overline:** `0.6875rem / 700 / 0.12em tracking / uppercase / var(--color-primary)`
**Form label:** `0.75rem / 600 / 0.04em tracking / uppercase / var(--color-text-secondary)`
**Table header:** `0.6875rem / 700 / 0.08em tracking / uppercase / var(--color-primary)`
**Stat value:** `2rem / 800 / 1.0 line-height / var(--color-primary)`

---

## 4. Spacing System

Base unit: **4px**. All spacing is a multiple of 4.

| Token | Value | Typical Use |
|-------|-------|-------------|
| `--space-1` | `4px` | Icon-to-text gap |
| `--space-2` | `8px` | Inline element gaps |
| `--space-3` | `12px` | Form field inner gap |
| `--space-4` | `16px` | Component padding, form group gap |
| `--space-6` | `24px` | Card padding, section sub-gaps |
| `--space-8` | `32px` | Section inner spacing |
| `--space-12` | `48px` | Section top/bottom padding |
| `--space-20` | `80px` | Hero / large CTA sections |

**Section padding:** `5rem 0` desktop, `3rem 0` mobile (≤768px)

---

## 5. Border Radius Scale

```css
--radius-xs:   4px;      /* Badges, chips, tags */
--radius-sm:   6px;      /* Small buttons, inputs */
--radius-md:   10px;     /* Standard buttons */
--radius-lg:   14px;     /* Cards, panels */
--radius-xl:   20px;     /* Modals, drawers, large cards */
--radius-full: 9999px;   /* Pills, avatar circles */
```

---

## 6. Component Design Specifications

### 6.1 Buttons

One primary CTA per screen. Three visual tiers:

| Variant | Background | Text | Hover |
|---------|-----------|------|-------|
| **primary** | `--gradient-primary` | `#fff` | `opacity: 0.88 + translateY(-1px)` |
| **accent** | `--gradient-accent` | `#fff` | `--color-accent-hover` |
| **secondary** | `--color-surface` | `--color-primary` | `--color-primary-subtle` bg |
| **ghost** | `transparent` | `--color-text-body` | `--color-bg-hover` bg |
| **danger** | `--color-danger-subtle` | `--color-danger` | solid danger bg + white text |

**Base styles:**
```css
height: 40px;           /* Large: 48px */
padding: 0 18px;        /* Large: 0 28px */
font-size: 0.875rem;
font-weight: 600;
border-radius: var(--radius-md);
transition: all 0.18s ease;
cursor: pointer;
```

**Focus ring (keyboard nav):**
```css
outline: none;
box-shadow: 0 0 0 3px var(--color-primary-subtle), 0 0 0 5px var(--color-primary-border);
```

### 6.2 Cards

```css
/* Base .es-card */
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-sm);

/* Interactive hover (use prefers-reduced-motion guard) */
transform: translateY(-2px);
box-shadow: var(--shadow-md);
```

**Stat cards** — left accent border (3px) instead of top border:
```
┌─3px accent─────────────────────────┐
│  Label (XS uppercase)  [Icon 40px] │
│  Value (2rem / 800)                │
│  ↑ Trend vs period (sm text)       │
└────────────────────────────────────┘
```

Accent colors: primary (indigo), accent (orange), success (green), warning (amber)

### 6.3 Badges

```css
/* Base */
display: inline-flex; align-items: center; gap: 4px;
padding: 2px 8px;
border-radius: var(--radius-xs);
font-size: 0.6875rem; font-weight: 700;
letter-spacing: 0.04em; text-transform: uppercase;
white-space: nowrap;
```

**Role → Color mapping:**
| Role | Background | Text |
|------|-----------|------|
| Admin | `--color-primary-subtle` | `--color-primary` |
| Organizer | `rgba(124,58,237,0.10)` | `#7C3AED` |
| Attendee | `--color-success-subtle` | `--color-success` |
| Vendor | `--color-warning-subtle` | `--color-warning` |
| Venue Manager | `--color-accent-subtle` | `--color-accent` |
| Finance Officer | `--color-info-subtle` | `--color-info` |

**Status → Color mapping:**
- Active / Published / Approved / Paid → Success
- Pending / Submitted / Draft → Warning
- Cancelled / Rejected / Suspended → Danger
- Completed → Info

### 6.4 Form Inputs

```css
height: 44px;
padding: 0 12px;
border: 1.5px solid var(--color-border);
border-radius: var(--radius-sm);
background: var(--color-bg-subtle);
font-family: var(--font-sans);
font-size: 0.9375rem;
color: var(--color-text-primary);
transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;

/* Focus */
border-color: var(--color-primary);
background: var(--color-surface);
box-shadow: 0 0 0 3px var(--color-primary-subtle);
outline: none;

/* Error */
border-color: var(--color-danger);
box-shadow: 0 0 0 3px var(--color-danger-subtle);
```

Remove saffron left-border accent — replaced with indigo focus ring.
Error message: directly below field, `var(--color-danger)`, `0.8125rem`.

### 6.5 Tables

```css
/* Header */
background: var(--color-bg-subtle);
border-bottom: 1.5px solid var(--color-border);
/* TH: 0.6875rem / 700 / 0.08em / uppercase / var(--color-text-secondary), padding 10px 16px */

/* Rows */
border-bottom: 1px solid var(--color-border-subtle);
/* TD: 0.8125rem / 400 / var(--color-text-body), padding 12px 16px */

/* Hover */
background: var(--color-bg-hover);
```

### 6.6 Modals

```css
/* Backdrop */
background: rgba(15, 23, 42, 0.50);

/* Panel */
background: var(--color-surface);
border-radius: var(--radius-xl);
box-shadow: var(--shadow-lg);
max-width: 480px;

/* Enter animation */
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
animation: modalIn 0.22s ease-out both;
```

Sections: Header `padding: 20px 24px 16px` / Body `padding: 20px 24px` / Footer `padding: 16px 24px`

### 6.7 Navigation

**Public Header:**
- Default: `var(--color-surface)` bg, `1px solid var(--color-border)` bottom
- Scrolled: `rgba(255,255,255,0.85)` + `backdrop-filter: blur(12px)`
- Remove navy gradient (`#001a5c`) entirely from the header

**Sidebar (authenticated):**
```css
/* Container */
background: var(--color-surface);
border-right: 1px solid var(--color-border);
width: 240px; /* collapsed: 56px */

/* Nav item */
height: 40px; padding: 0 12px;
border-radius: var(--radius-sm);
font-size: 0.875rem; font-weight: 500;
color: var(--color-text-secondary);

/* Active */
background: var(--color-primary-subtle);
color: var(--color-primary);
font-weight: 600;
border-left: 2px solid var(--color-primary);
padding-left: 10px; /* compensate 2px border */
```

---

## 7. Page Layouts

### 7.1 Landing Page — Section Order

1. **Hero** — `--gradient-hero` bg + SVG grid overlay
2. **Stats strip** — white/surface bg, 4 metrics
3. **Features** — 2×2 card grid
4. **How It Works** — 3-step cards
5. **Testimonials** — 3 quote cards (already implemented)
6. **Roles** — 2×3 card grid
7. **CTA Band** — `--gradient-hero` bg, same as hero

**Hero SVG grid overlay (decorative):**
```html
<div aria-hidden="true" style="position:absolute;inset:0;overflow:hidden;pointer-events:none">
  <svg width="100%" height="100%">
    <defs>
      <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hero-grid)"/>
  </svg>
</div>
```

### 7.2 Dashboard Pages

Replace gradient banners with a clean page header:
```
┌──────────────────────────────────────────┐ ← var(--color-bg), no gradient
│  Breadcrumb › Current Page               │
│  Page Title (display, 700)  [Actions →]  │
│  Subtitle text (body, secondary)         │
└──────────────────────────────────────────┘
```

### 7.3 Auth Pages (Login / Register)

Desktop split layout:
```
┌──────────────────┬──────────────────────────┐
│  Brand panel     │  Form card               │
│  --gradient-hero │  max-width: 420px        │
│  logo + tagline  │  --shadow-md             │
│  feature bullets │  --radius-xl             │
└──────────────────┴──────────────────────────┘
```
Mobile: form card full-width, brand panel hidden.

---

## 8. Animation System

```css
--motion-fast:   0.12s ease;       /* Hover, press */
--motion-normal: 0.22s ease-out;   /* Modals, enter */
--motion-slow:   0.38s ease-out;   /* Scroll animations */
--motion-exit:   0.15s ease-in;    /* Exit (faster than enter) */
```

All animations must include:
```css
@media (prefers-reduced-motion: reduce) {
  /* Remove or disable animation */
}
```

---

## 9. Dark Mode

**Three-layer surface system:**
| Layer | Value |
|-------|-------|
| Page bg | `#0C0E14` |
| Card / Surface | `#161923` |
| Modal / Raised | `#1E2330` |
| Sidebar | `#0F1117` (deeper than surface) |

**Shadows in dark mode → border glow instead:**
```css
[data-theme="dark"] .es-card {
  box-shadow: none;
  border-color: rgba(255,255,255,0.08);
}
[data-theme="dark"] .es-card:hover {
  border-color: rgba(99,102,241,0.40);
  box-shadow: 0 0 0 1px rgba(99,102,241,0.20);
}
```

---

## 10. Accessibility Requirements

| Check | Standard |
|-------|---------|
| Body text contrast | ≥ 4.5:1 |
| Large text contrast (≥18px bold) | ≥ 3:1 |
| Focus ring | 3px `var(--color-primary)` offset ring |
| Touch targets | ≥ 44×44px |
| Reduced motion | Respected globally |
| Decorative icons | `aria-hidden="true"` |
| Skip link | Present in AppLayout |
| Heading hierarchy | h1 → h6 sequential, no skips |

---

## 11. Implementation Phases

### Phase 1 — Token Foundation
- `index.html`: preconnect + preload Plus Jakarta Sans
- `src/index.css`: new CSS custom properties (colors, shadows, gradients, radius, motion, font)

### Phase 2 — Global Component Layer
- `src/index.css`: rewrite `.es-card`, `.es-stat-card-*`, `.es-badge-*`, `.es-hero`, `.es-cta-band`, `.es-stats-strip` with new tokens
- `src/App.css`: update hero/CTA gradient, stats strip
- `src/css/layout/Header.module.css`: surface navbar + blur-on-scroll
- `src/css/layout/Sidebar.module.css`: new active state, standardized sizing

### Phase 3 — Page-Level Components
- `src/components/layout/Header.tsx`: remove `variant="dark"`
- `src/components/pages/Home.tsx`: SVG overlay, hero h1 size, accent CTA
- `src/components/pages/auth/Login.tsx` + `Register.tsx`: split layout
- Dashboard banners: replace gradient with clean header

### Phase 4 — Polish
- `src/components/layout/AppLayout.tsx`: skip link
- Global `prefers-reduced-motion` reset
- All CSS modules: wrap hover/transform in motion media query
