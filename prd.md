# VYNE — Product Requirements Document
**Version 1.0 · MVP Scope · March 2026**

---

## 1. Product Overview

VYNE is a SaaS design system management platform that bridges the gap between design and engineering. It gives teams — designers, developers, and product managers — a single workspace to browse, customize, and sync UI components directly with their codebase via GitHub.

Built on **shadcn/ui** as its base component library, VYNE lets teams tweak component properties visually in real time through a **Dial Kit panel** (powered by [`dialkit`](https://github.com/joshpuckett/dialkit) + `motion`), then push those changes back to their GitHub repository. Every company gets an isolated workspace where the entire team can collaborate.

> **Dial Kit** is a floating control panel for React that auto-generates sliders, toggles, color pickers, spring editors, and action buttons from a config object via `useDialKit()`. Changes reflect live in the UI without any re-renders or boilerplate.

---

## 2. Problem Statement

Design systems today are fragmented across tools. Designers manage tokens in Figma, developers maintain component code in GitHub, and there is no live, interactive layer connecting the two. This creates:

- **Drift** between designed and built components
- **High friction** when updating design tokens or variants — requires a developer to manually edit code
- **No single source of truth** — PMs, designers, and engineers all reference different things
- **No live preview** of how component changes affect rendered output before committing to code

VYNE solves this by being the live, interactive layer that sits between Figma and GitHub.

---

## 3. Target Users

| User | Pain Today | What VYNE Gives Them |
|---|---|---|
| **Designer** | Exports Figma specs, hands off to devs, never verifies implementation | Live component editor — see the real rendered output, not a mock |
| **Developer** | Maintains components in code with no visual preview tool | GitHub-connected source of truth with auto-generated PR diffs |
| **Product Manager** | Reads code or navigates Figma just to see what variants exist | Browsable component catalog with no code required |

---

## 4. MVP Feature Set

The MVP consists of four core pillars, all required for launch.

---

### 4.1 Component Browser

A visual, searchable catalog of all components in the workspace design system.

- Grid/list view of all components with live-rendered thumbnails
- Category-based navigation matching shadcn structure:
  - **Inputs:** Button, Input, Textarea, Checkbox, Switch, Slider
  - **Display:** Badge, Progress, Skeleton
- Search and filter by component name or category
- Click any component to open it in the Dial Kit editor

---

### 4.2 Dial Kit Editor

The core editing experience. Powered by `dialkit` + `motion` — a floating control panel wired directly to live component values via `useDialKit()`.

Each component in VYNE exposes a `useDialKit` config split into two sections:

#### Code Properties *(Component-level props)*
Rendered as a **select / toggle** in the Dial Kit panel:

| Property | Control Type | Example Values |
|---|---|---|
| Variant | `select` | `default`, `destructive`, `outline`, `ghost` |
| Size | `select` | `sm`, `md`, `lg`, `xl`, `2xl` |
| Shape | `select` | `rounded`, `square`, `pill` |
| Label | `text` | Free text input |
| Leading Icon | `select` | Icon name from Lucide set |
| Trailing Icon | `select` | Icon name or `none` |
| Disabled | `boolean` (toggle) | `true` / `false` |
| Is Loading | `boolean` (toggle) | `true` / `false` |

#### Design Properties *(Token-level, CSS variables)*
Rendered as **sliders** in the Dial Kit panel:

| Property | Control Type | Range |
|---|---|---|
| Border Radius | `[default, min, max]` | `[8, 0, 48]` |
| Padding X | `[default, min, max]` | `[16, 0, 64]` |
| Padding Y | `[default, min, max]` | `[8, 0, 32]` |
| Gap | `[default, min, max]` | `[8, 0, 32]` |
| Font Size | `[default, min, max]` | `[14, 10, 24]` |
| Font Weight | `select` | `400`, `500`, `600`, `700` |
| Letter Spacing | `[default, min, max]` | `[0, -2, 4]` |
| Opacity | `[default, min, max]` | `[100, 0, 100]` |
| Shadow | `[default, min, max]` | `[2, 0, 10]` |

#### Example `useDialKit` wiring for a Button component

```tsx
import { useDialKit } from 'dialkit';
import { motion } from 'motion/react';

function ButtonPreview() {
  const p = useDialKit('Button', {
    // Code props
    variant: { type: 'select', options: ['default', 'destructive', 'outline', 'ghost'], default: 'default' },
    size: { type: 'select', options: ['sm', 'md', 'lg', 'xl'], default: 'md' },
    shape: { type: 'select', options: ['rounded', 'square', 'pill'], default: 'rounded' },
    label: { type: 'text', default: 'Click me' },
    disabled: false,
    isLoading: false,

    // Design tokens
    borderRadius: [8, 0, 48],
    paddingX: [16, 0, 64],
    paddingY: [8, 0, 32],
    fontSize: [14, 10, 24],
    opacity: [100, 0, 100],
    shadow: [2, 0, 10],
  });

  return (
    <motion.button
      disabled={p.disabled}
      style={{
        borderRadius: p.borderRadius,
        paddingLeft: p.paddingX,
        paddingRight: p.paddingX,
        paddingTop: p.paddingY,
        paddingBottom: p.paddingY,
        fontSize: p.fontSize,
        opacity: p.opacity / 100,
      }}
    >
      {p.label}
    </motion.button>
  );
}
```

#### Canvas
- Live preview re-renders on every Dial Kit change (no page refresh)
- Dark / light canvas background toggle
- Version selector (Version 1, 2, 3…) to switch between saved presets
- Dial Kit panel supports **built-in presets** and **JSON export** (native to `dialkit`)

---

### 4.3 Copy Code Snippet

Every component configuration in the Dial Kit can be exported as a ready-to-use code snippet.

- **Copy Code** button generates a shadcn-compatible JSX/TSX snippet with current prop values baked in
- Snippet reflects all Dial Kit changes — variant, size, custom design tokens
- Supports React JSX and TSX targets
- Code preview panel shows formatted snippet before copying

---

### 4.4 GitHub Two-Way Sync

VYNE connects directly to a company's GitHub repository to keep the design system in sync. This is the core differentiator.

#### Connection Setup
- OAuth-based GitHub authentication during workspace onboarding
- Repo selection — choose target repository and branch
- Path configuration — specify the directory holding component files

#### Pull *(GitHub → VYNE)*
- On workspace load, VYNE reads the connected repo and surfaces existing component files
- Detects shadcn component structure and maps props to Dial Kit controls automatically

#### Push *(VYNE → GitHub)*
- **Push to GitHub** button commits Dial Kit changes back to the repo
- Always creates a **Pull Request** — never pushes directly to `main`
- Auto-generated commit message describes exactly what changed:
  `"Update Button: borderRadius 8 → 24, paddingX 16 → 20"`
- PR description includes a before/after visual diff of the component

---

### 4.5 Team Workspace

Every company on VYNE gets a shared workspace where all team members collaborate on the same design system.

- Company-level workspace with role-based access: **Admin**, **Editor**, **Viewer**
- Invite team members by email
- All component configs and Dial Kit changes are shared across the workspace
- One GitHub repo per workspace (multi-repo support is post-MVP)

---

## 5. Feature Priority Summary

| Feature | Priority | Scope |
|---|---|---|
| Component Browser | P0 | MVP |
| Dial Kit — Code Properties | P0 | MVP |
| Dial Kit — Design Properties (sliders) | P0 | MVP |
| Live Preview Canvas | P0 | MVP |
| Copy Code Snippet | P0 | MVP |
| GitHub OAuth + Repo Connection | P0 | MVP |
| GitHub Push as PR | P0 | MVP |
| GitHub Pull (read + map components) | P0 | MVP |
| Dial Kit Presets + JSON Export | P0 | MVP (native to dialkit) |
| Team Workspace + Invites | P1 | MVP |
| Role-Based Access (Admin/Editor/Viewer) | P1 | MVP |
| Version History / Changelog | P1 | V2 |
| Commenting & Design Reviews | P2 | V2 |
| Component Usage Analytics | P2 | V2 |
| Storybook-style Live Preview | P2 | V2 |
| Figma Sync | P3 | V3 |

---

## 6. Out of Scope — MVP

- Figma plugin or bidirectional Figma sync
- Version history and changelog
- Commenting and annotation on components
- Component usage analytics
- Storybook integration
- Support for component libraries other than shadcn
- Multiple GitHub repos per workspace
- Direct push to `main` branch (always PR-first)
- Custom component import (teams start from shadcn base)

---

## 7. Key User Flows

### 7.1 Onboarding a New Workspace
1. Company admin signs up → creates workspace → names the design system
2. Connect GitHub: OAuth → select repo → select branch → select component directory
3. VYNE scans the repo, maps existing shadcn components, populates the Component Browser
4. Admin invites team members by email with role assignment

### 7.2 Editing a Component
1. User opens Component Browser → clicks **Button**
2. Dial Kit panel floats in on the right with all current prop values auto-loaded
3. User adjusts: Variant → `destructive`, Shape → `rounded`, Border Radius slider → `24`
4. Live canvas re-renders instantly via `useDialKit` reactive values
5. User clicks **Copy Code** to grab the snippet, or **Push to GitHub** to create a PR

### 7.3 Pushing to GitHub
1. User clicks **Push to GitHub** from the Dial Kit
2. Modal shows a diff summary of all changes made since last sync
3. User confirms → VYNE creates a PR on the connected branch with auto-generated commit message
4. PR link is shown in VYNE for the user to review and merge in GitHub

---

## 8. Technical Notes

> These are directional notes — final decisions to be made during sprint planning.

### 8.1 What Gets Pushed to GitHub

TBD during technical scoping. Options in order of preference:

1. **CSS variable updates** in `globals.css` or a Tailwind config file — least invasive, safest for MVP
2. **Updated component `.tsx` files** with new default prop values
3. **Design token JSON** (`tokens.json`) consumed by the codebase

**Recommendation:** Start with CSS variable updates for MVP.

### 8.2 Dial Kit Integration Architecture

- `dialkit` + `motion` are installed as dependencies in the VYNE platform itself
- Each shadcn component in VYNE's Component Browser has a corresponding `useDialKit` config that maps all its props and design tokens to controls
- The Dial Kit panel (`<DialRoot />`) is mounted once at the app root level
- When a user selects a component in the browser, the relevant `useDialKit` config is activated and the panel populates with that component's controls
- Spring animations via `motion` are used for panel transitions and canvas preview interactions

### 8.3 Custom vs. shadcn Components

MVP: All teams start from the shadcn component library as their base. The ability to import or bring existing custom components is post-MVP.

---

## 9. Success Metrics — MVP

| Metric | Definition |
|---|---|
| **Activation** | % of new workspaces that successfully connect a GitHub repo within 7 days |
| **Engagement** | Average component edits per active workspace per week |
| **Conversion** | % of Dial Kit edits that result in a Copy Code or Push to GitHub action |
| **Retention** | % of workspaces active at 30 and 60 days post-onboarding |

---

## 10. Post-MVP Roadmap (V2)

### Version History & Changelog
Every push to GitHub is logged as a versioned entry in VYNE. Teams can see what changed, when, and by whom. Previous versions can be restored with one click.

### Commenting & Design Reviews
Teammates can leave comments on specific components or property states. Enables async design review inside VYNE without switching tools.

### Component Usage Analytics
Track which components are most used, which variants are most common, and surface underused or abandoned components across the codebase.

### Storybook-style Live Preview
Expand the canvas to render components in multiple states simultaneously — default, hover, active, disabled, loading — native to VYNE, no Storybook setup required.

---

*VYNE · Confidential · MVP PRD v1.0 · March 2026*