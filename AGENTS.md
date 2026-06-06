# Architecture Notes

This project is a Nuxt application backed by Better Auth, Cloudflare D1, Cloudflare AI, and Google OAuth/Calendar integrations.

## Server Structure

```text
server/
|-- plugins/
|   `-- auth.ts                <- Better Auth instance (Google OAuth + Orgs)
|-- utils/
|   |-- db.ts                  <- useDB() helper
|   |-- ai.ts                  <- useAI() helper
|   |-- auth.ts                <- useAuth() / requireAuth() helpers
|   |-- calendar.ts            <- Google Calendar API wrapper
|   `-- birthday.ts            <- shared birthday business logic
`-- api/
    |-- auth/
    |   `-- [...all].ts        <- Better Auth catch-all handler
    |-- birthdays/
    |   |-- index.ts           <- GET (list), POST (create)
    |   `-- [id]/
    |       |-- index.ts       <- GET, PUT, DELETE
    |       |-- gifts.ts       <- POST -> AI gift generation
    |       `-- calendar.ts    <- POST (sync), DELETE (unsync)
    `-- organizations/
        |-- index.ts           <- GET (my orgs), POST (create org)
        `-- [orgId]/
            |-- index.ts       <- GET, PATCH, DELETE org
            `-- invitations.ts <- POST (invite), GET (list pending)
```

## Auth Flow

```text
User hits app
  |
  v
Not signed in -> redirect to /login
  |
  v
Click "Continue with Google"
  |
  v
Better Auth requests scopes:
  - openid
  - email
  - profile
  - https://www.googleapis.com/auth/calendar.events
  |
  v
Google redirects back -> Better Auth stores access_token + refresh_token in account table
  |
  v
User lands on dashboard
  |
  v
No org? -> prompt to create one or accept pending invite
Has org? -> load birthdays for all their orgs
```

## API Routes Detail

### Birthdays

`GET /api/birthdays?orgId=xxx`

Returns all birthdays for that org. User must be a member of that org.

`POST /api/birthdays`

Body:

```json
{
  "orgId": "string",
  "name": "string",
  "relation": "string",
  "birthDate": "YYYY-MM-DD",
  "includeYear": true,
  "interests": ["string"],
  "notes": "string"
}
```

Creates a birthday. If the user has calendar connected, this can optionally auto-sync.

`GET /api/birthdays/:id`

Returns a single birthday plus that user's calendar sync status.

`PUT /api/birthdays/:id`

Body: partial `Birthday`.

Any org member can edit. If calendar is synced, updates the event.

`DELETE /api/birthdays/:id`

Only org owner or `created_by` user can delete. Removes `calendar_sync` rows. Each user's event cleanup is handled client-side or via background job.

`POST /api/birthdays/:id/gifts`

Body:

```json
{
  "vibe": "string",
  "budget": "string"
}
```

Pulls birthday data, builds prompt with name, relation, age if `includeYear`, interests, notes, and saved gifts to avoid repeats. Calls Cloudflare AI with `json_schema` response format. Returns `GiftGenerationResponse`.

`POST /api/birthdays/:id/calendar`

Gets user's Google access token from `account` table, refreshes if expired, creates recurring annual Google Calendar event, and saves to `calendar_sync` table.

`DELETE /api/birthdays/:id/calendar`

Gets `calendar_event_id` from `calendar_sync` for current user, deletes from Google Calendar, and removes `calendar_sync` row.

### Organizations

`GET /api/organizations`

Returns all orgs current user belongs to, with their role.

`POST /api/organizations`

Body:

```json
{
  "name": "string"
}
```

Creates an org and sets user as owner. Better Auth handles this.

`GET /api/organizations/:orgId`

Returns org details and member list.

`PATCH /api/organizations/:orgId`

Body:

```json
{
  "name": "string"
}
```

Owner only.

`DELETE /api/organizations/:orgId`

Owner only. Cascades to birthdays.

`POST /api/organizations/:orgId/invitations`

Body:

```json
{
  "email": "user@example.com",
  "role": "member"
}
```

Role can be `"member"` or `"owner"`. Better Auth sends invite email. Invitation remains pending until accepted.

`GET /api/organizations/:orgId/invitations`

Lists pending invitations. Owner only.

## AI Gift Generation

Shared prompt logic lives in `server/utils/birthday.ts` as `buildGiftPrompt(birthday, options)`.

Prompt includes:

- Person's name and relation
- Age, if `includeYear: true`, calculated from `birthDate`
- Interests list
- Notes
- Already saved gifts, to avoid duplicates
- Requested vibe filter, if provided
- Budget hint, if provided

## Key Data Flows

### Loading the Dashboard

```text
auth store hydrates from session
  -> fetch /api/organizations
  -> set activeOrg (last used, stored in localStorage)
  -> fetch /api/birthdays?orgId=activeOrg
  -> sort by upcoming (next birthday from today)
  -> render BirthdayCards
```

### Generating Gift Ideas

```text
User opens birthday detail
  -> clicks "Generate Gift Ideas"
  -> optionally picks a vibe filter
  -> POST /api/birthdays/:id/gifts
  -> server builds prompt
  -> server calls Cloudflare AI
  -> no streaming; single response
  -> client renders GiftIdeaCards
  -> user can "Save" an idea
  -> PUT /api/birthdays/:id adds to savedGifts array
```

### Calendar Sync

```text
User clicks sync on a birthday
  -> POST /api/birthdays/:id/calendar
  -> server gets their Google token from account table
  -> refreshes if needed
  -> creates recurring RRULE event on Google Calendar
  -> saves event ID to calendar_sync
  -> CalendarSyncButton shows "Synced"
```

### Inviting a Family Member

```text
Owner opens org settings
  -> enters email in InviteModal
  -> POST /api/organizations/:orgId/invitations
  -> Better Auth sends invite email with accept link
  -> recipient clicks link
  -> recipient signs in with Google
  -> recipient joins org
  -> recipient sees all birthdays for that family
```

## Build Plan

### Step 1 — Cloudflare Bindings & Nuxt Config [DONE]

Get the runtime wired up before anything else touches it.

- [x] `wrangler.jsonc` — D1 + AI bindings
- [x] `nuxt.config.ts` — Nitro preset, runtime config, transpile
- [x] `server/utils/db.ts` — `useDB()` helper
- [x] `server/utils/ai.ts` — `useAI()` helper
- [x] Verify bindings work locally with `wrangler dev`

### Step 2 — D1 Migration [DONE]

Apply the schema to the database.

- [x] Run `npx drizzle-kit generate`
- [x] Apply locally: `wrangler d1 migrations apply birthday-app-db --local`
- [x] Verify tables exist with `wrangler d1 execute birthday-app-db --local --command "SELECT name FROM sqlite_master WHERE type='table'"`

### Step 3 — Auth Routes & Middleware [DONE]

Wire up sign-in before any protected route exists.

- [x] `server/api/auth/[...all].ts` — Better Auth handler
- [x] `server/utils/auth.ts` — `requireAuth()`, `requireOrgMember()` helpers
- [x] `server/plugins/auth.ts` — Nitro plugin
- [x] `app/middleware/auth.ts` — client route guard
- [x] `lib/auth-client.ts` — client instance with org plugin
- [x] Test: Google sign-in flow works end to end

### Step 4 — Auth Pages (UI) [DONE]

Bare minimum pages to get a user signed in.

- [x] `app/pages/login.vue` — Google sign-in button
- [x] `app/pages/index.vue` — redirect logic (no org → create one, has org → dashboard)
- [x] Basic layout with sign-out

### Step 5 — Organization API Routes [DONE]

Must exist before birthday routes since birthdays belong to orgs.

- [x] `GET /api/organizations` — list user's orgs
- [x] `POST /api/organizations` — create org (Better Auth handles internally, thin wrapper)
- [x] `GET /api/organizations/[orgId]` — org detail + members
- [x] `PATCH /api/organizations/[orgId]` — rename (owner only)
- [x] `DELETE /api/organizations/[orgId]` — delete (owner only, cascades)
- [x] `POST /api/organizations/[orgId]/invitations` — invite by email
- [x] `GET /api/organizations/[orgId]/invitations` — list pending

### Step 6 — Organization UI [DONE]

Needed before dashboard since dashboard requires an active org.

- [x] `app/pages/organizations/new.vue` — create family group form
- [x] `app/pages/organizations/[orgId]/settings.vue` — rename, members, invite, danger zone
- [x] `components/org/OrgSwitcher.vue` — dropdown to switch active family
- [x] `components/org/MemberList.vue`
- [x] `components/org/InviteModal.vue`
- [x] `stores/organizations.ts` — Pinia store, active org persisted to localStorage

### Step 7 — Birthday API Routes [DONE]

Core CRUD, no AI or calendar yet.

- [x] `GET /api/birthdays?orgId=` — list, sorted by upcoming
- [x] `POST /api/birthdays` — create
- [x] `GET /api/birthdays/[id]` — single
- [x] `PUT /api/birthdays/[id]` — update (any member)
- [x] `DELETE /api/birthdays/[id]` — delete (owner or createdBy)
- [x] `server/utils/birthday.ts` — shared helpers (upcoming sort, age calc, JSON parse/serialize)

### Step 8 — Birthday UI [DONE]

Main app functionality.

- [x] `app/pages/dashboard.vue` — birthday list for active org
- [x] `app/pages/birthdays/new.vue` — add birthday form
- [x] `app/pages/birthdays/[id].vue` — detail page (shell, gifts + calendar added later)
- [x] `components/birthday/BirthdayCard.vue` — upcoming summary card
- [x] `components/birthday/BirthdayForm.vue` — shared create/edit form
- [x] `components/birthday/CountdownBadge.vue` — "in 12 days" pill
- [x] `stores/birthdays.ts` — Pinia store
- [x] `composables/useBirthdays.ts`

### Step 9 — Gift Generation API

AI integration, depends on birthday routes existing.

- [ ] `POST /api/birthdays/[id]/gifts` — build prompt → call CF AI → return ideas
- [ ] `server/utils/gift.ts` — `buildGiftPrompt()`, prompt logic, schema
- [ ] Wire up `json_schema` response format correctly (from our earlier work)

### Step 10 — Gift Generation UI

- [ ] `components/gift/GiftGenerator.vue` — trigger button, vibe filter, loading state
- [ ] `components/gift/GiftIdeaCard.vue` — card with vibe badge, save button
- [ ] `components/gift/SavedGiftsList.vue` — saved gifts on detail page
- [ ] `stores/gifts.ts` — ephemeral, clears on navigation
- [ ] `composables/useGiftGeneration.ts`
- [ ] Wire save gift → `PUT /api/birthdays/[id]` updating `savedGifts`

### Step 11 — Google Calendar Integration

- [ ] `server/utils/calendar.ts` — token refresh, create/update/delete event
- [ ] `POST /api/birthdays/[id]/calendar` — sync
- [ ] `DELETE /api/birthdays/[id]/calendar` — unsync
- [ ] `components/calendar/CalendarSyncButton.vue`
- [ ] `composables/useCalendarSync.ts`
- [ ] Test token refresh flow (access token expiry)

### Step 12 — Polish & Edge Cases

- [ ] Loading skeletons on all data-fetching pages
- [ ] Empty states (no org, no birthdays, no gifts)
- [ ] Error handling (toast notifications)
- [ ] Birthday today / this week highlight
- [ ] Confirm dialogs on destructive actions (delete birthday, delete org)
- [ ] Invite accept flow (email link → sign in → join org)
- [ ] Mobile responsive pass

### Step 13 — Deploy

- [ ] `wrangler d1 migrations apply birthday-app-db --remote`
- [ ] Set environment variables in Cloudflare dashboard
- [ ] `wrangler pages deploy` or connect to Git for CI
- [ ] Set Google OAuth redirect URI to production URL
- [ ] Smoke test end to end on prod

