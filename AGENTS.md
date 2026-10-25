# AGENTS.md
# Guidelines for AI Coding Agents working on "Web Bóc Tách Vật Tư Nội Thất & Báo Giá"

## Quick Context
This workspace is a Next.js (App Router) + Supabase + Tailwind CSS web platform for interior woodworking workshops. It parses Cutlist Excel spreadsheets, computes material requirements (MDF boards, edge banding, hardware, labor), produces Workshop BOMs and Client PDF quotes, and hosts an AutoCAD Lisp marketplace.

## Crucial Directives
- **Single Source of Truth:** All project rules and constraints are defined in [GEMINI.md](file:///c:/Users/KIET_PC/Desktop/Web%20n%E1%BB%99i%20th%E1%BA%A5t/GEMINI.md).
- **Sub-rules:**
  - Database & RLS: [.agents/rules/database.md](file:///c:/Users/KIET_PC/Desktop/Web%20n%E1%BB%99i%20th%E1%BA%A5t/.agents/rules/database.md)
  - Calculations & Formulas: [.agents/rules/calculations.md](file:///c:/Users/KIET_PC/Desktop/Web%20n%E1%BB%99i%20th%E1%BA%A5t/.agents/rules/calculations.md)
  - AutoLISP & CAD Plugin Development: [.agents/rules/autolisp.md](file:///c:/Users/KIET_PC/Desktop/Web%20n%E1%BB%99i%20th%E1%BA%A5t/.agents/rules/autolisp.md)

## Core Invariants
1. **Modular Monolith:** Core shared logic in `src/core/`; independent features in `src/modules/`.
2. **Calculations Directory:** Never write costing or area calculation logic in UI components. Only import from `src/core/calculations/`.
3. **Snapshot Pricing:** Material unit prices are copied at project creation to preserve historical quotes.
4. **Row Level Security (RLS):** Every Supabase query must respect RLS (`auth.uid() = user_id`). Prices are confidential trade secrets.
5. **No Speculative Bloat:** Adhere to Ponytail and Karpathy engineering disciplines. Touch only files directly related to the user task.
6. **Superior Benchmarking Law:** All recreated plugins/tools (SketchUp, AutoCAD, Web) must objectively surpass the original benchmark plugins (Profile Builder, OpenCutList, CutList Plus, ABF, etc.) in both feature richness and execution quality. No superficial clones.
7. **Web-Twin Design System (No AI Slop & No Bloat Logos):** All software tools (SketchUp HtmlDialogs, AutoCAD DCL / Dialogs, Web App) must strictly mirror the web app's clean architectural aesthetic: Slate 50 `--bg: #f8fafc`, 24px blueprint grid, Pure White `--card-bg: #ffffff`, warm wood Amber 500 `--brand: #f59e0b`, Emerald 600 `--primary: #059669` (actions), Inter typography, and JetBrains Mono tabular numbers. Generic pitch-black AI dark slop is strictly banned. In plugins/desktop tools, NEVER include promotional logos or bloated banners; keep the UI compact, minimalist, utilitarian, and direct for craftsmen.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
