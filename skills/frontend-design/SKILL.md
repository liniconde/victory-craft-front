---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when building or redesigning pages, components, dashboards, landing pages, or polishing UI in React, HTML, CSS, or similar frontend stacks.
---

# Frontend Design

Use this skill when the task is primarily about frontend presentation, UI structure, styling, or visual polish.

## Goals

Build working frontend code that is:

- Production-grade and functional
- Visually distinctive and intentional
- Cohesive in tone, typography, spacing, and motion
- Appropriate for the product, audience, and existing design system

## Workflow

Before coding:

1. Identify the purpose of the interface and who will use it.
2. Choose a clear aesthetic direction that fits the request.
3. Check whether the project already has an established design language.
4. Preserve existing patterns when working inside an established product; introduce stronger visual direction only where it fits.

Then implement the code with a consistent visual system:

- Define a deliberate color palette and prefer reusable CSS variables or theme tokens.
- Use typography with character; avoid generic fallback-heavy choices unless the project already depends on them.
- Create clear hierarchy through spacing, scale, contrast, and composition.
- Add a small number of meaningful motion moments instead of scattering generic effects everywhere.
- Make responsive behavior feel designed, not merely compressed.

## Aesthetic Guidance

Aim for interfaces that avoid generic "AI slop" patterns:

- Avoid default-feeling layouts and interchangeable component styling.
- Avoid overused purple-on-white gradient aesthetics unless the brand truly calls for them.
- Avoid weak visual hierarchy, timid color use, and purely decorative motion.

Prefer:

- Strong, memorable typography choices
- Cohesive palettes with one or two intentional accents
- Layered backgrounds, subtle texture, or depth when appropriate
- Asymmetry, overlap, framing, or other composition decisions that create identity
- Restraint when the product calls for refinement over spectacle

## Implementation Notes

- Match code complexity to the design goal.
- Minimal interfaces should feel precise, not empty.
- Bold interfaces should still remain usable and maintainable.
- Prioritize accessibility, readable contrast, and clear interaction states.
- In React projects, follow the repo's existing architecture and component patterns.

## Repo-Specific Reminder

For Victory Craft, prefer improvements that fit the current React + Vite frontend and preserve consistency across shared navigation, pages, and microfrontend surfaces unless the task explicitly asks for a larger redesign.
