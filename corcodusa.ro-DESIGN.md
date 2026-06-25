# Design System Inspired by Corcodusa

## 1. Visual Theme & Atmosphere

Corcodusa's design system embodies playful, educational energy with warm, vibrant hues that evoke creativity and joy for children aged 3–7. The system combines bold, saturated accent colors with a clean, approachable aesthetic that balances fun illustration and serious pedagogical content. Soft shadows and rounded corners create an inviting, non-threatening environment while maintaining readability and visual hierarchy. The gradient transition from green to orange to yellow across hero sections establishes momentum and excitement, positioning learning as an adventure. Typography is bold and confident, reinforcing authority while remaining child-friendly.

**Key Characteristics**
- Warm, energetic color palette dominated by orange, yellow, and rich greens
- Clean neutral foundation (`#1F2937`, `#E5E7EB`) for stability
- Generous whitespace and rounded containers fostering approachability
- Strong visual contrast supporting accessibility for young learners
- Large, bold typography with high-impact serif-free readability
- Illustrative, mascot-driven branding (Corcodusa the apple character)
- Subtle shadows adding depth without visual clutter

## 2. Color Palette & Roles

### Primary
- **Orange Primary** (`#FF6B00`): Main call-to-action buttons, accent highlights, and branded UI elements; conveys energy and playfulness for children's education
- **Green Brand** (`#0A4D68`): Secondary primary, used in navigation, cards, and foundational UI; paired with orange for visual balance

### Accent Colors
- **Yellow Accent** (`#FFD700`): Warning states, highlight elements, and secondary CTAs; creates warm complementary contrast
- **Warm Yellow** (`#FACC15`): Warning and attention states; lighter alternative for status indicators

### Interactive
- **Blue Teal** (`#2C5F7A`): Interactive elements, hover states, links, and informational components; evokes trust and calmness
- **Dark Slate** (`#374151`): Secondary interactive text and muted UI states

### Neutral Scale
- **Charcoal** (`#1F2937`): Primary text, headings, and high-contrast elements; dominant throughout the system
- **Medium Gray** (`#4B5563`): Secondary text, descriptions, and de-emphasized content
- **Light Gray** (`#6B7280`): Tertiary text and disabled states
- **Lightest Gray** (`#D1D5DB`): Subtle borders and dividers
- **Very Light Gray** (`#E5E7EB`): Backgrounds, subtle fills, and section separators
- **Almost White** (`#F3F4F6`): Minimal backgrounds and alternating section fills
- **Off White** (`#F9FAFB`): Page backgrounds and neutral surfaces

### Surface & Borders
- **White** (`#FFFFFF`): Primary surfaces, cards, and containers; ensures content legibility
- **Border Gray** (`#E5E7EB`): All borders and dividing lines; maintains visual separation without harshness
- **Black** (`#000000`): Critical high-contrast text, overlays, and accessibility fallbacks

### Semantic / Status
- **Success Green** (`#25B838`): Success states, confirmations, and positive feedback
- **Alternative Success** (`#20BF55`): Secondary success indicator for variant states

## 3. Typography Rules

### Font Family
**Primary Font:** Segoe UI, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif
- Used for all body text, buttons, navigation, and UI labels; provides clarity and modern accessibility

**Secondary Font:** system-ui, ui-sans-serif, sans-serif
- Used for emphasis, strong elements, and accent typography; ensures performance and fallback reliability

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| Display (H1) | Segoe UI | 96px | 900 | 96px | 0px | Hero headlines; maximum visual impact for page titles |
| Heading (H2) | Segoe UI | 48px | 900 | 48px | 0px | Section headings; large, bold visual anchors |
| Subheading (H3) | Segoe UI | 18px | 600 | 28px | 0px | Card titles, subsections; maintains hierarchy clarity |
| Body (Paragraph) | Segoe UI | 30px | 400 | 36px | 0px | Primary body text for content and descriptions |
| Body Small | Segoe UI | 16px | 400 | 24px | 0px | Navigation, labels, captions, secondary body text |
| Emphasis (Strong) | system-ui | 20px | 700 | 30px | 0px | Bold callouts, interactive prompts, accent text |
| Link | Segoe UI | 16px | 400 | 24px | 0px | Navigation links, inline hypertext |
| Link Emphasized | Segoe UI | 16px | 500 | 24px | 0px | Active links, highlighted navigation states |
| Code / Monospace | Segoe UI | 14px | 400 | 21px | 0px | Inline code, technical labels; maintain monospace fallback if needed |

### Principles
- Typography hierarchy relies on weight (400, 500, 600, 700, 900) and scale rather than color shifts
- Paragraph leading is generous (1.2x–1.5x multiplier) to support young readers and dyslexia-friendly spacing
- All type scales follow a base unit of 4px increments for vertical rhythm consistency
- Contrast ratio between text and background must meet WCAG AA standards (4.5:1 minimum for body, 3:1 for large text)
- Emphasis via weight and size is preferred over italic; italic avoided for accessibility
- Brand display type (H1, H2) uses maximum weight (900) to command visual attention and convey authority

## 4. Component Stylings

### Buttons

#### Primary Button (Orange)
- **Background:** `#FF6B00`
- **Text Color:** `#FFFFFF`
- **Font Size:** `20px`
- **Font Weight:** `700`
- **Font Family:** Segoe UI
- **Padding:** `16px 32px`
- **Border Radius:** `16px`
- **Border:** `0px solid transparent`
- **Box Shadow:** `rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px`
- **Height:** `60px`
- **Line Height:** `28px`
- **Hover State:** Darken background to `#E55A00`, lift shadow elevation
- **Active State:** Background `#CC4D00`, reduce shadow
- **Disabled State:** Background `#C9B2A5`, text `#FFFFFF` at 50% opacity

#### Secondary Button (White Bordered)
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#FFFFFF`
- **Font Size:** `20px`
- **Font Weight:** `600`
- **Font Family:** Segoe UI
- **Padding:** `16px 32px`
- **Border Radius:** `16px`
- **Border:** `4px solid #FFFFFF`
- **Box Shadow:** `rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px`
- **Height:** `68px`
- **Line Height:** `28px`
- **Hover State:** Background `rgba(255, 255, 255, 0.15)`, border remains `4px solid #FFFFFF`
- **Active State:** Background `rgba(255, 255, 255, 0.25)`
- **Disabled State:** Border `4px solid rgba(255, 255, 255, 0.5)`, text `#FFFFFF` at 50% opacity

#### Tertiary Button (Yellow)
- **Background:** `#FFD700`
- **Text Color:** `#1F2937`
- **Font Size:** `20px`
- **Font Weight:** `700`
- **Font Family:** Segoe UI
- **Padding:** `16px 32px`
- **Border Radius:** `16px`
- **Border:** `0px solid transparent`
- **Box Shadow:** `rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px`
- **Height:** `60px`
- **Line Height:** `28px`
- **Hover State:** Background `#F0C800`, text remains `#1F2937`
- **Active State:** Background `#E6BA00`
- **Disabled State:** Background `#D9D0B5`, text `#1F2937` at 50% opacity

#### Ghost Button (Text Only)
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#1F2937`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Font Family:** Segoe UI
- **Padding:** `16px 24px`
- **Border Radius:** `0px`
- **Border:** `0px solid transparent`
- **Box Shadow:** `none`
- **Height:** `60px`
- **Line Height:** `24px`
- **Hover State:** Text color `#FF6B00`, background `rgba(255, 107, 0, 0.05)`
- **Active State:** Text color `#E55A00`, background `rgba(255, 107, 0, 0.1)`
- **Disabled State:** Text color `#B0B0B0`

#### Small Utility Button
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Text Color:** `#374151`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Font Family:** Segoe UI
- **Padding:** `8px 8px`
- **Border Radius:** `8px`
- **Border:** `0px solid transparent`
- **Box Shadow:** `none`
- **Height:** `auto`
- **Line Height:** `24px`
- **Hover State:** Background `#E5E7EB`, text `#1F2937`
- **Active State:** Background `#D1D5DB`
- **Disabled State:** Text color `#B0B0B0`

### Cards & Containers

#### Feature Card (White Container)
- **Background:** `#FFFFFF`
- **Border Radius:** `12px`
- **Border:** `0px solid transparent`
- **Box Shadow:** `rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px`
- **Padding:** `24px 24px`
- **Margin:** `0px`
- **Gap Between Elements:** `16px`
- **Hover State:** Box shadow lifts to `rgba(0, 0, 0, 0.15) 0px 20px 30px -5px`
- **Heading:** `#1F2937`, `18px`, weight `600`
- **Body Text:** `#4B5563`, `16px`, weight `400`

#### Colored Section Container (Teal/Blue)
- **Background:** `#2C5F7A` (gradient from `#0A4D68` to `#2C5F7A`)
- **Border Radius:** `16px`
- **Border:** `0px solid transparent`
- **Box Shadow:** `rgba(0, 0, 0, 0.1) 0px 25px 50px -12px`
- **Padding:** `48px 40px`
- **Heading:** `#FFFFFF`, `48px`, weight `900`, line height `48px`
- **Body Text:** `#E5E7EB`, `16px`, weight `400`
- **Gap Between Elements:** `24px`

#### Neutral Background Section
- **Background:** `#F9FAFB`
- **Border Radius:** `0px`
- **Border:** `0px solid transparent`
- **Padding:** `64px 40px`
- **Gap Between Elements:** `32px`

### Inputs & Forms

#### Text Input
- **Background:** `#FFFFFF`
- **Border:** `1px solid #D1D5DB`
- **Border Radius:** `8px`
- **Padding:** `12px 16px`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Font Family:** Segoe UI
- **Text Color:** `#1F2937`
- **Placeholder Color:** `#9CA3AF`
- **Height:** `44px`
- **Focus State:** Border `2px solid #FF6B00`, box shadow `0px 0px 0px 3px rgba(255, 107, 0, 0.1)`
- **Error State:** Border `2px solid #DC2626`, box shadow `0px 0px 0px 3px rgba(220, 38, 38, 0.1)`
- **Disabled State:** Background `#F3F4F6`, text color `#9CA3AF`, border `1px solid #E5E7EB`

#### Checkbox
- **Size:** `20px × 20px`
- **Border:** `2px solid #D1D5DB`
- **Border Radius:** `4px`
- **Background (Unchecked):** `#FFFFFF`
- **Background (Checked):** `#FF6B00`
- **Checkmark Color:** `#FFFFFF`
- **Focus State:** Box shadow `0px 0px 0px 3px rgba(255, 107, 0, 0.1)`
- **Disabled State:** Background `#F3F4F6`, border `2px solid #E5E7EB`

#### Label
- **Font Size:** `16px`
- **Font Weight:** `500`
- **Font Family:** Segoe UI
- **Text Color:** `#1F2937`
- **Margin Bottom:** `8px`
- **Display:** Block

### Navigation

#### Top Navigation Bar
- **Background:** `#FFFFFF`
- **Height:** `80px`
- **Padding:** `0px 32px`
- **Border:** `0px solid transparent`
- **Border Bottom:** `1px solid #E5E7EB`
- **Box Shadow:** `rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px`
- **Display:** Flex, align-items: center

#### Navigation Link (Default)
- **Text Color:** `#1F2937`
- **Font Size:** `16px`
- **Font Weight:** `400`
- **Font Family:** Segoe UI
- **Padding:** `8px 16px`
- **Border Radius:** `8px`
- **Background:** `rgba(0, 0, 0, 0)` (transparent)
- **Hover State:** Background `#F3F4F6`, text color `#FF6B00`
- **Active State:** Background `rgba(255, 107, 0, 0.1)`, text color `#FF6B00`, font weight `500`

#### Navigation Link (Active Pill)
- **Text Color:** `#FF6B00`
- **Font Size:** `16px`
- **Font Weight:** `500`
- **Font Family:** Segoe UI
- **Padding:** `8px 16px`
- **Border Radius:** `8px`
- **Background:** `rgba(255, 107, 0, 0.1)`
- **Border:** `0px solid transparent`

### Badge

#### Success Badge
- **Background:** `rgba(37, 184, 56, 0.1)`
- **Text Color:** `#16A34A`
- **Font Size:** `14px`
- **Font Weight:** `600`
- **Font Family:** Segoe UI
- **Padding:** `4px 12px`
- **Border Radius:** `12px`
- **Border:** `1px solid #25B838`

#### Warning Badge
- **Background:** `rgba(250, 204, 21, 0.1)`
- **Text Color:** `#1F2937`
- **Font Size:** `14px`
- **Font Weight:** `600`
- **Font Family:** Segoe UI
- **Padding:** `4px 12px`
- **Border Radius:** `12px`
- **Border:** `1px solid #FACC15`

## 5. Layout Principles

### Spacing System
- **Base Unit:** `4px`
- **Scale:** `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px`, `64px`, `80px`, `128px`, `144px`
- **Padding (Components):** `8px` (compact), `16px` (standard), `24px` (generous), `32px` (spacious)
- **Margin (Sections):** `24px` (component groups), `48px` (feature sections), `64px` (major sections), `80px` (hero separation)
- **Gap (Flex/Grid):** `16px` (inline elements), `24px` (component groups), `32px` (content blocks), `48px` (section separation)
- **Usage Context:** Padding scales with container importance; margins increase between major content zones; gaps maintain visual rhythm within groups

### Grid & Container
- **Max Width:** `1152px` (desktop container)
- **Column Strategy:** 12-column flexible grid for desktop; 6-column for tablet; single-column for mobile
- **Gutters:** `32px` on desktop, `24px` on tablet, `16px` on mobile
- **Section Patterns:** Full-bleed hero (100vw), constrained content (max 1152px centered), alternating light/dark sections
- **Container Padding:** `40px` horizontal on desktop, `24px` on tablet, `16px` on mobile

### Whitespace Philosophy
Generous whitespace creates breathing room between content elements, supporting both cognitive load reduction for young learners and visual hierarchy clarity. Vertical rhythm uses consistent multiples of base unit to establish predictable spacing flow. Sections are separated by substantial gaps (48px–80px) to denote conceptual breaks. Components maintain internal consistency with symmetric padding; asymmetric spacing avoided except for directional cues (e.g., arrow icons).

### Border Radius Scale
- **`0px`:** Navigation, full-width sections, blocks without visual softness
- **`4px`:** Minimal rounding for tight, functional UI (form fields in variants, small badges)
- **`8px`:** Utility buttons, small input fields, tertiary interactive elements
- **`12px`:** Cards, image containers, featured content blocks
- **`16px`:** Primary buttons, large interactive surfaces, hero call-to-action elements

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| None (Flat) | No shadow, `box-shadow: none` | Navigation bar, ghost buttons, text-only links, flat sections |
| Subtle (Small) | `rgba(0, 0, 0, 0.1) 0px 4px 6px -4px` | Secondary cards, disabled states, navigation links |
| Standard (Medium) | `rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px` | Default cards, active buttons, hover states on containers |
| Elevated (Large) | `rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px` | Primary buttons, featured cards, interactive overlays |
| Maximum (Extra Large) | `rgba(0, 0, 0, 0.25) 0px 25px 50px -12px` | Modals, drawers, sticky elements, maximum visual prominence |

**Shadow Philosophy:**
Shadows are subtle and purposeful, avoiding harsh or excessive depth that could overwhelm young users. The shadow system uses layered, soft gaussian blur for accessibility and legibility. Elevation progresses linearly with interactivity; interactive elements receive more pronounced shadows. Flat design is preferred for navigation and non-interactive content to minimize visual noise. Hover and focus states lift elements via shadow increase, providing tactile feedback without moving elements.

## 7. Do's and Don'ts

### Do
- Use `#FF6B00` (orange primary) for all primary call-to-action buttons and critical interactive prompts
- Maintain minimum padding of `16px` around content within cards and containers for breathing room
- Apply generous line spacing (1.2x–1.5x multiplier) to all body text, especially smaller sizes (<20px)
- Ensure all interactive elements have clear, visually distinct hover states with color shift or shadow lift
- Group related content within `12px`–`16px` gap spacing to establish visual hierarchy
- Use white (`#FFFFFF`) backgrounds for content cards to maximize readability and contrast
- Test all text color combinations against WCAG AA contrast standards (4.5:1 minimum for body, 3:1 for large text)
- Apply rounded corners (`8px`–`16px`) consistently to interactive and card-based UI
- Use the Segoe UI font stack exclusively for all body, navigation, and UI text
- Center align hero content and use full-width gradient backgrounds for brand impact

### Don't
- Avoid using small text (<16px) without proportional line height increase; maintain minimum 1.5x multiplier
- Don't nest shadows beyond one level (avoid compound `box-shadow` stacking); use the elevation system
- Avoid color combinations beyond the defined palette; maintain brand consistency with approved hex values
- Don't use italic type for body or UI text; reserve italic for edge cases (e.g., disclaimers, foreign terms)
- Avoid placing critical information in low-contrast zones (text on light gray backgrounds without sufficient ratio)
- Don't use harsh borders (`1px solid #000000`); default to `#D1D5DB` or remove borders entirely
- Avoid asymmetric padding on buttons and interactive elements unless directional (e.g., icon alignment)
- Don't mix font families across UI components; system-ui is secondary only for emphasis and accent text
- Avoid over-using shadows or depth; reserve maximum shadow elevation for modals and overlays only
- Don't disable hover states on touch devices without fallback focus states for accessibility

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Key Changes |
|-----------------|-------|-------------|
| Mobile | `0px–576px` | Single-column layout, full-width sections, `16px` horizontal padding, `14px` body font, `36px` H2 |
| Tablet | `577px–1024px` | 2–4 column grid, `24px` horizontal padding, `18px` body font, `40px` H2, `48px` gap between sections |
| Desktop | `1025px+` | 12-column grid, `32px–40px` horizontal padding, `30px` body font, `48px` H2, `64px` gap between sections, max-width `1152px` |

### Touch Targets
- **Minimum Size:** `44px × 44px` for all interactive elements (buttons, links, form controls)
- **Recommended Size:** `48px × 48px` for primary CTAs and high-frequency interactions
- **Spacing Between Targets:** `8px` minimum; `12px` preferred for adjacent buttons to prevent accidental taps
- **Large Touch Areas:** Hero buttons and main navigation links should reach `60px` height on mobile for easy targeting
- **Hover Zone Padding:** Expand click zones by `8px` on all sides via invisible padding; visible focus indicators required for keyboard navigation

### Collapsing Strategy
- **Hero Section:** Full-width background on all breakpoints; headline scales from `96px` (desktop) → `48px` (tablet) → `32px` (mobile); call-to-action buttons remain `60px` height for touch
- **Navigation Bar:** Desktop horizontal menu collapses to hamburger icon on tablet/mobile; drawer slides from left with `32px` padding
- **Grid Layout:** Desktop 12-column → tablet 6-column → mobile 1-column; margins collapse from `64px` (desktop) → `32px` (tablet) → `24px` (mobile)
- **Cards/Content:** Feature cards maintain `24px` padding on desktop, reduce to `16px` on tablet, `12px` on mobile
- **Images:** Scale responsively with max-width `100%`, min-width enforced at `280px` on mobile to prevent excessive shrinking
- **Typography:** H1 responsive scaling: `96px` (desktop) → `56px` (tablet) → `32px` (mobile) using `calc()` or media query breakpoints
- **Sections:** Full-bleed colored sections (hero, feature) remain full-width; constrained content sections respect max-width `1152px` on desktop only
- **Button Width:** Buttons flex to full-width on mobile (`width: 100%`), constrain to natural width on desktop

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA Button:** Orange Primary (`#FF6B00`)
- **Secondary Button (Bordered):** White (`#FFFFFF`) border on transparent
- **Tertiary Button (Alternate CTA):** Yellow (`#FFD700`)
- **Heading Text:** Charcoal (`#1F2937`)
- **Body Text:** Charcoal (`#1F2937`) or Medium Gray (`#4B5563`)
- **Navigation Background:** White (`#FFFFFF`)
- **Section Background (Blue):** Dark Teal (`#0A4D68`) or Medium Teal (`#2C5F7A`)
- **Neutral Section Background:** Off White (`#F9FAFB`) or Very Light Gray (`#F3F4F6`)
- **Card Container:** White (`#FFFFFF`)
- **Border:** Light Gray (`#E5E7EB`)
- **Success State:** Green (`#25B838`)
- **Warning State:** Yellow (`#FACC15` or `#FFD700`)
- **Disabled Text:** `#9CA3AF`
- **Interactive Link (Active):** Orange (`#FF6B00`) on light background `rgba(255, 107, 0, 0.1)`

### Iteration Guide

1. **Always use `#FF6B00` for primary interactive CTAs** — this is the brand signature color and must remain consistent across all screens and states. Buttons using this color receive shadow elevation `rgba(0, 0, 0, 0.1) 0px 20px 25px -5px`.

2. **Maintain minimum `16px` padding on all interactive elements** — buttons require `16px 32px` (vertical × horizontal), utility buttons `8px`, inputs `12px 16px`. Exceptions are utility/ghost buttons at smaller scales.

3. **Apply the full shadow stack for elevated interactive elements:** `rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px` for primary buttons and featured cards; reduce to medium shadow for secondary elements.

4. **Use Segoe UI exclusively for all body, navigation, UI text** — fallback stack is `-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`. system-ui is secondary, used only for emphasis/strong elements at `20px 700` weight.

5. **Scale typography responsively:** H1 at `96px` desktop → `56px` tablet → `32px` mobile; body text `30px` → `18px` → `16px`. Maintain consistent line-height multiplier (1.2x–1.5x) across breakpoints.

6. **Enforce WCAG AA contrast ratio (4.5:1 body, 3:1 large text)** — always pair dark text (`#1F2937`, `#374151`) on light backgrounds (`#FFFFFF`, `#F9FAFB`) and light text (`#FFFFFF`, `#E5E7EB`) on dark backgrounds (`#0A4D68`, `#2C5F7A`).

7. **Build section hierarchy with background colors:** Teal/blue (`#2C5F7A`, `#0A4D68`) for feature/CTA sections, off-white (`#F9FAFB`) for neutral content, white (`#FFFFFF`) for content cards. Full-width sections inherit color; constrained sections remain white or inherit.

8. **Round corners consistently:** Cards and feature containers `12px`, primary buttons and inputs `16px` or `8px` (utility), navigation items `0px` (flat). Border radius `0px` reserved for full-width elements and flat components.

9. **Implement touch-friendly interactive targets:** All buttons and links minimum `44px × 44px`, preferably `48px` on mobile. Hero CTAs maintain `60px` height. Spacing between adjacent buttons `8px` minimum, `12px` preferred.

10. **Apply focus states on all interactive elements:** Keyboard users require visible outline or color shift. Text links shift to orange (`#FF6B00`), buttons shift background or add `0px 0px 0px 3px rgba(255, 107, 0, 0.1)` focus ring. Never remove default focus outlines without replacement.