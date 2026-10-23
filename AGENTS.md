# Project Guidance

## User Preferences

- Premium blue-and-white design inspired by Linear, Stripe, Apple, Vercel, and Airbnb
- Inter or Geist typography with strong visual hierarchy
- Mobile-first, fully responsive across phone, tablet, and desktop
- Frictionless report submission without student login
- No mock data, no localStorage as primary database, no fake functionality, no decorative buttons
- Accessible forms, keyboard navigation, and visible focus indicators
- Optional polished dark mode

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend list() pagination is 1-based: use (page - 1) * pageSize to match the frontend's 1-based page (BrowsePage, HomePage, AdminPage).
- Platform object-storage uploads require both the caffeineai-object-storage mops dependency and include MixinObjectStorage() in src/backend/main.mo; the frontend package alone cannot upload (IC0536 otherwise).
- Motoko gotchas: 'query', 'shared', and 'actor' are reserved keywords; mo:core Time.Time is Int so convert before using as a Nat timestamp; OQL .payload needs NatValue/TextValue imported top-level in the entity-declaring file; enhanced-migration mixin constants must be 'transient let'.
- A shadcn sonner Toaster component existing in components/ui does not mean it is mounted; mount <Toaster /> once at the app root or all toast feedback is invisible.
- Public report projections omit private contact fields, so the reporter's browser caches contact keyed by management code; edit forms must block saving rather than write placeholder contact data.
- BarcodeDetector is not universally available; feature-detect it and fall back to manual code entry rather than failing silently.
- TanStack Router routes without validateSearch accept optional search, so Link to=/report without search still typechecks.
