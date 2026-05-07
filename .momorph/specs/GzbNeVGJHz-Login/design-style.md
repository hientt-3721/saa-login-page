# Design Style: Login

**Frame ID**: `GzbNeVGJHz`
**Frame Name**: `Login`
**File Key**: `9ypp4enmFmdK3YAFJLIu6C`
**Extracted At**: 2026-05-07

---

## Design Tokens

### Colors

| Token Name | Hex / RGBA | Usage |
|---|---|---|
| `--color-bg-page` | `#00101A` | Full-page background |
| `--color-header-bg` | `rgba(11, 15, 18, 0.80)` | Header bar background (80% opacity) |
| `--color-overlay-h` | `linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)` | Horizontal overlay on background photo |
| `--color-overlay-v` | `linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)` | Vertical bottom fade overlay |
| `--color-btn-login-bg` | `#FFEA9E` | Login button background |
| `--color-btn-login-text` | `#00101A` | Login button label text |
| `--color-text-on-dark` | `#FFFFFF` | All text on dark background (labels, footer, hero copy) |
| `--color-divider` | `#2E3940` | Footer top border |

### Typography

| Token Name | Font Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| `--text-lang-label` | Montserrat | 16px | 700 | 24px | 0.15px |
| `--text-hero-body` | Montserrat | 20px | 700 | 40px | 0.5px |
| `--text-btn-login` | Montserrat | 22px | 700 | 28px | 0px |
| `--text-footer` | Montserrat Alternates | 16px | 700 | 24px | 0% |

> All text on this screen is **bold (700)** — there are no regular-weight text nodes.

### Spacing

| Token Name | Value | Usage |
|---|---|---|
| `--spacing-page-padding-x` | `144px` | Shared horizontal padding for **both** header and hero section — logo left edge and Key Visual left edge are both at x=144px; no extra offset between them |
| `--spacing-page-padding-y` | `12px` / `96px` | Header vertical padding / Hero section vertical padding |
| `--spacing-hero-stack-gap` | `80px` | Gap between Key Visual and text+button stack |
| `--spacing-hero-content-gap` | `24px` | Gap between hero description text and login button |
| `--spacing-btn-login-padding` | `16px 24px` | Login button inner padding |
| `--spacing-btn-login-gap` | `8px` | Gap between label and Google icon inside login button |
| `--spacing-lang-btn-padding` | `16px` | Language button inner padding (all sides) |
| `--spacing-lang-btn-gap` | `2px` | Gap between flag+label group and chevron |
| `--spacing-flag-label-gap` | `4px` | Gap between SVG flag and "VN"/"EN" label text |
| `--spacing-footer-padding-x` | `90px` | Footer horizontal padding |
| `--spacing-footer-padding-y` | `40px` | Footer vertical padding |

### Border & Radius

| Token Name | Value | Usage |
|---|---|---|
| `--radius-lang-btn` | `4px` | Language selector button corner radius |
| `--radius-login-btn` | `8px` | Login button corner radius |
| `--border-footer-top` | `1px solid #2E3940` | Footer top separator |

### Media Assets

> **Download script**: `scripts/download-login-assets.sh`  — run `bash scripts/download-login-assets.sh` from project root.
> Directory structure already created: `public/assets/login/{icons,images}/`

#### Asset Catalog & Placement Guide

| # | Local path | Figma asset | Node ID | Dimensions | Where used in UI | `<img>` / CSS usage | Download status |
|---|---|---|---|---|---|---|---|
| 1 | `public/assets/login/icons/logo.png` | `MM_MEDIA_Logo` | `I662:14391;178:1033;178:1030` | 52 × 48 px | **Header A.1** — brand logo, top-left | `<img src="/assets/login/icons/logo.png" width="52" height="48" alt="SAA Logo" />` | ⬜ pending |
| 2 | `public/assets/login/images/root-further-logo.png` | `MM_MEDIA_Root_Further_Logo` | `2939:9548` | 451 × 200 px (ratio 115/51) | **Hero B.1** — "ROOT FURTHER" key visual, centered-left | `<img src="/assets/login/images/root-further-logo.png" width="451" height="200" alt="Root Further" style="object-fit:cover" />` | ⬜ pending |
| 3 | `public/assets/login/images/hero-background.png` | `image 1` (background photo) | `662:14389` | 1441 × 1022 px (ratio 141/100) | **Page background** — absolute full-bleed, offset -440px/-218px, scale 159.8%/133.4% | `background: url('/assets/login/images/hero-background.png') lightgray -440px -217.975px / 159.763% 133.371% no-repeat` | ⬜ pending |
| 4 | `public/assets/login/icons/flag-vn.png` | `MM_MEDIA_VN` | `I662:14391;186:1696;186:1821;186:1709` | 24 × 24 px | **Language selector** — trigger display + dropdown item 1 (VN) | `<img src="/assets/login/icons/flag-vn.png" width="24" height="24" alt="Vietnam" />` | ⬜ pending |
| 5 | `public/assets/login/icons/flag-en.svg` | `MM_MEDIA_EN` (not in Login frame — pre-created) | — | 24 × 24 px | **Language selector** — dropdown item 2 (EN) | `<img src="/assets/login/icons/flag-en.svg" width="24" height="24" alt="English" />` | ✅ done (Union Jack SVG) |
| 6 | `public/assets/login/icons/chevron-down.png` | `MM_MEDIA_Down` | `I662:14391;186:1696;186:1821;186:1441` | 24 × 24 px | **Language selector** — chevron icon, right of trigger | `<img src="/assets/login/icons/chevron-down.png" width="24" height="24" alt="" aria-hidden="true" />` | ⬜ pending |
| 7 | `public/assets/login/icons/google.png` | `MM_MEDIA_Google` | `I662:14426;186:1766` | 24 × 24 px | **Login button B.3** — Google icon, right of label text | `<img src="/assets/login/icons/google.png" width="24" height="24" alt="Google" />` | ⬜ pending |

#### Download Checklist

Run `bash scripts/download-login-assets.sh` then check each off:

- [x] `public/assets/login/icons/logo.png` — MoMorph S3 key `b1e72bf604326f7af02ce0e47ef0a638.png`
- [x] `public/assets/login/images/root-further-logo.png` — MoMorph S3 key `2e900e000847f138c2a99f075b1db9a8.png`
- [x] `public/assets/login/images/hero-background.png` — stable URL: `https://momorph.ai/api/images/9ypp4enmFmdK3YAFJLIu6C/662:14389/127763e01fa1f7169aaf137bf06f7bb4.png`
- [x] `public/assets/login/icons/flag-vn.png` — Figma node `I662:14391;186:1696;186:1821;186:1709`
- [x] `public/assets/login/icons/flag-en.svg` — pre-created Union Jack SVG (EN variant not in Figma Login frame)
- [x] `public/assets/login/icons/chevron-down.png` — Figma node `I662:14391;186:1696;186:1821;186:1441`
- [x] `public/assets/login/icons/google.png` — Figma node `I662:14426;186:1766`

---

## Layout Specifications

### Page Frame

| Property | Value |
|---|---|
| Width | 1440px |
| Height | 1024px |
| Background | `#00101A` |

### Layout Structure (ASCII)

```
┌──────────────────────────────────────────────────────────────┐  1440 × 1024px  bg: #00101A
│  ░░░░░░░░░░░░  Background photo (absolute, full-bleed)  ░░░░ │  z-index: 1
│  ▓▓▓▓▓▓▓▓▓▓▓  Horizontal gradient overlay (Rectangle 57) ▓▓▓ │
│  ▓▓▓▓▓▓▓▓▓▓▓  Vertical bottom-fade overlay (Cover)  ▓▓▓▓▓▓▓▓ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │  Header: h=80px, top=0
│  │  [Logo 52×48]       ...gap...     [VN 🏳️ VN ▾ 108×56] │  │  padding: 12px 144px
│  └────────────────────────────────────────────────────────┘  │  bg: rgba(11,15,18,0.8)
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │  Hero section: top=88px
│  │  padding: 96px 144px  (same 144px as header)           │  │  w=1440, h=845
│  │  → logo left edge = Key Visual left edge = x:144px     │  │  no extra h-offset
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  Frame 487  (w=1152, flex-col, gap=80px)         │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  B.1 Key Visual  (w=1152, h=200)           │  │  │  │
│  │  │  │  [ROOT FURTHER logo image  451×200px]      │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  │  (gap: 80px)                                     │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │  Frame 550  (w=496, padding-left=16px)     │  │  │  │
│  │  │  │  flex-col, gap=24px                        │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  B.2 Hero text  (w=480, h=80)         │  │  │  │  │
│  │  │  │  │  "Bắt đầu hành trình..."              │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  │  (gap: 24px)                               │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  B.3 Login Button  (w=305, h=60)      │  │  │  │  │
│  │  │  │  │  [LOGIN With Google]  [Google 24×24]  │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │  Footer: top=933px
│  │  border-top: 1px solid #2E3940                        │  │  padding: 40px 90px
│  │  "Bản quyền thuộc về Sun* © 2025"                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Style Details

### A — Header (`mms_A_Header` · `662:14391`)

| Property | Value |
|---|---|
| width | 1440px |
| height | 80px |
| position | absolute; top: 0; left: 0 |
| display | flex |
| flex-direction | row |
| justify-content | space-between |
| align-items | center |
| padding | 12px 144px |
| gap | 238px |
| background-color | `rgba(11, 15, 18, 0.80)` |

---

### A.1 — Logo (`mms_A.1_Logo` · `I662:14391;186:2166`)

| Property | Value |
|---|---|
| width | 52px |
| height | 56px |
| position | absolute; left: 144px; top: 12px |
| Asset | `MM_MEDIA_Logo` — 52 × 48px; `object-fit: cover` |

---

### A.2 — Language Selector Trigger Button (`Button` · `I662:14391;186:1696;186:1821`)

| Property | Value |
|---|---|
| width | 108px |
| height | 56px |
| position | absolute; right: 144px; top: 12px |
| display | flex |
| flex-direction | row |
| justify-content | space-between |
| align-items | center |
| padding | 16px |
| gap | 2px |
| border-radius | 4px |
| background | _(none — transparent)_ |

**Inner layout (flag + label group `Frame 485`):**

| Property | Value |
|---|---|
| display | flex; flex-direction: row; align-items: center |
| gap | 4px |
| width | 53px; height: 24px |

**Language label text (`Awards Information Navigation Links`):**

| Property | Value |
|---|---|
| font-family | Montserrat |
| font-size | 16px |
| font-weight | 700 |
| line-height | 24px |
| letter-spacing | 0.15px |
| color | `#FFFFFF` |
| text-align | center |
| width | 25px; height: 24px |

**SVG Flag icon (`MM_MEDIA_VN` / `MM_MEDIA_EN`):**

| Property | Value |
|---|---|
| width | 24px; height: 24px |

**Chevron icon (`MM_MEDIA_Down`):**

| Property | Value |
|---|---|
| width | 24px; height: 24px |

**Dropdown items** (2 items, in display order):

| # | Language | SVG Asset | Label | Locale value |
|---|---|---|---|---|
| 1 | Vietnamese | `MM_MEDIA_VN` — 24×24 SVG (`flag-vn.svg`) | `VN` | `'vi'` |
| 2 | English | `MM_MEDIA_EN` — 24×24 SVG (`flag-en.svg`, source from componentSet `178:1020`) | `EN` | `'en'` |

Each item row layout:

| Property | Value |
|---|---|
| display | flex; flex-direction: row; align-items: center |
| gap | 4px |
| flag | 24 × 24px SVG |
| label | Montserrat 700 16px `#FFFFFF` (token: `--text-lang-label`) |

---

### B.2 — Hero Description Text (`mms_B.2_content` · `662:14753`)

| Property | Value |
|---|---|
| width | 480px |
| height | 80px |
| font-family | Montserrat |
| font-size | 20px |
| font-weight | 700 |
| line-height | 40px |
| letter-spacing | 0.5px |
| color | `#FFFFFF` |
| text-align | left |

---

### B.3 — Login Button (`Button-IC About` · `662:14426`)

| Property | Value |
|---|---|
| width | 305px |
| height | 60px |
| display | flex |
| flex-direction | row |
| align-items | center |
| justify-content | flex-start |
| padding | 16px 24px |
| gap | 8px |
| border-radius | 8px |
| background-color | `#FFEA9E` |

**Label text (`Awards Information Navigation Links`):**

| Property | Value |
|---|---|
| font-family | Montserrat |
| font-size | 22px |
| font-weight | 700 |
| line-height | 28px |
| letter-spacing | 0px |
| color | `#00101A` |
| text-align | center |
| width | 225px; height: 28px |

**Google icon (`MM_MEDIA_Google`):**

| Property | Value |
|---|---|
| width | 24px; height: 24px |
| position | right of label (last child in flex row) |

**Button states** _(not defined in Figma static frame; implement per spec.md behavior)_:

| State | Expected style |
|---|---|
| Default | `background: #FFEA9E; cursor: pointer` |
| Hover | Add `box-shadow` (elevated effect); spec.md: shadow or elevated effect |
| Loading | Disabled; replace Google icon with spinner; `opacity: 0.7; cursor: not-allowed` |
| Disabled | `opacity: 0.7; cursor: not-allowed` |

---

### C — Background (`mms_C_Keyvisual` · `662:14388` + `Rectangle 57` · `662:14392` + `Cover` · `662:14390`)

Three layered absolute elements composing the background:

| Layer | Node | Style |
|---|---|---|
| Background photo | `662:14389` | `width: 1441px; height: 1022px; background: url(...) lightgray -440px -217.975px / 159.763% 133.371% no-repeat; aspect-ratio: 141/100` |
| Horizontal gradient | `662:14392` | `width: 1440px; height: 1024px; background: linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)` |
| Vertical bottom fade | `662:14390` | `width: 1440px; height: 1093px; top: 138px; background: linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)` |

---

### D — Footer (`mms_D_Footer` · `662:14447`)

| Property | Value |
|---|---|
| width | 1440px |
| position | absolute; top: 933px; left: 0 |
| display | flex |
| align-items | center |
| justify-content | space-between |
| padding | 40px 90px |
| border-top | `1px solid #2E3940` |

**Footer text:**

| Property | Value |
|---|---|
| font-family | Montserrat Alternates |
| font-size | 16px |
| font-weight | 700 |
| line-height | 24px |
| letter-spacing | 0% |
| color | `#FFFFFF` |
| text-align | center |
| width | 275px |

---

## Component Hierarchy with Styles

```
Login (1440×1024, bg: #00101A)
├── [abs] mms_C_Keyvisual (1441×1022, z=1)
│   └── image 1 — bg photo, offset -440/-218, scale 159.8%/133.4%
├── [abs] mms_A_Header (1440×80, top:0, px:144, py:12, bg:rgba(11,15,18,.8))
│   ├── mms_A.1_Logo (52×48, left:144, top:16)
│   │   └── MM_MEDIA_Logo — 52×48, cover
│   └── mms_A.2_Language (108×56, right:144, top:12)
│       └── Button (108×56, p:16, radius:4, flex space-between)
│           ├── Frame 485 (53×24, flex row, gap:4)  ← flag + label
│           │   ├── MM_MEDIA_VN — 24×24 SVG flag
│           │   └── "VN" — Montserrat 700 16px #FFF
│           └── MM_MEDIA_Down — 24×24 chevron
├── [abs] Rectangle 57 — horizontal gradient overlay (full 1440×1024)
├── [abs] mms_B_Bìa (1440×845, top:88, px:144, py:96)
│   └── Frame 487 (1152×653, flex-col, gap:80, justify:center)
│       ├── mms_B.1_Key Visual (1152×200)
│       │   └── MM_MEDIA_Root_Further_Logo — 451×200, cover, ratio 115/51
│       └── Frame 550 (496×164, flex-col, gap:24, pl:16)
│           ├── mms_B.2_content — Montserrat 700 20px #FFF lh:40 ls:0.5
│           └── mms_B.3_Login (305×60)
│               └── Button-IC About (305×60, p:16/24, radius:8, bg:#FFEA9E, flex, gap:8)
│                   ├── "LOGIN With Google " — Montserrat 700 22px #00101A lh:28
│                   └── MM_MEDIA_Google — 24×24
├── [abs] Cover — vertical bottom-fade gradient (1440×1093, top:138)
└── [abs] mms_D_Footer (1440, top:933, px:90, py:40, border-top:1px #2E3940)
    └── "Bản quyền thuộc về Sun* © 2025" — Montserrat Alternates 700 16px #FFF
```

---

## Notes for Implementation

1. **Dark theme only** — the entire screen uses a near-black `#00101A` palette. No light
   mode variant exists for this screen.
2. **Three background layers must be stacked** in `z-index` order:
   photo → horizontal gradient overlay → vertical bottom-fade overlay. All are `position: absolute`.
3. **Login button icon is on the right** (`MM_MEDIA_Google` is the last child in the flex row,
   after the label text).
4. **Language dropdown has 2 items**: VN (`MM_MEDIA_VN`) and EN (`MM_MEDIA_EN`). The EN flag
   **does not appear in the current Figma frame** (dropdown is shown collapsed with only VN
   visible in the trigger). Export the EN variant from componentSet `178:1020` in Figma.
   Both items: 24×24 SVG flag + Montserrat 700 16px label. Dropdown background/border are
   not defined in Figma — implement using `--color-header-bg`, `--color-divider`,
   `--radius-lang-btn`.
5. **Hover / loading / disabled states** for the login button are behavior-defined (see
   `spec.md`) and not captured in the static Figma frame. Shadow elevation on hover can
   be approximated with `box-shadow: 0 4px 16px rgba(255, 234, 158, 0.35)`.
6. **Footer is positioned at the very bottom** (`top: 933px`) with a single divider line —
   not a sticky footer; just absolutely positioned.
7. **All font families** used: `Montserrat` (header, hero, button) and
   `Montserrat Alternates` (footer only).
8. **Asset download**: Run `bash scripts/download-login-assets.sh` from project root to download
   all 7 assets. Directory structure `public/assets/login/{icons,images}/` is already created.
   Two items require manual action before running: (a) background photo — get fresh URL from
   `mcp_momorph_get_figma_image(nodeId: "662:14389")` and patch the script; (b) EN flag —
   locate the EN variant node ID in Figma componentSet `178:1020` and patch the script.
   Once downloaded, check off all items in the Download Checklist in the Media Assets section.
