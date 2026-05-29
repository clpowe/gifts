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
