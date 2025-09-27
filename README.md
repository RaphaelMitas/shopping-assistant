## Shopping Assistant — Modern Stack Hackathon Entry

A full‑stack app built with the modern stack to showcase realtime UX, robust auth, email, AI-assisted workflows, and pragmatic developer ergonomics.

### Highlights (what this code actually uses)

- **Convex + Agent Threads**: Realtime threads via `@convex-dev/agent` with streaming and pagination.
- **Auth via Better‑Auth**: Next.js route handler + Convex plugin, email verification and reset flows using Resend.
- **AI via OpenAI**: Agent configured with `gpt-5` and embeddings; tool-calling integrated.
- **Firecrawl Tool**: Web search internal action with rate limiting and validated results.
- **Usage & Billing via Autumn**: Track AI token usage and gate features; client/provider integrated.
- **UI**: Next.js App Router, Tailwind 4 + shadcn/ui, theme tokens, sidebar layout.

---

## The Modern Stack Hackathon

From AI agents to voice apps, the modern stack helps you go from idea to shipped product in record time.

### Timeline

- **September 16**: Hackathon starts
- **October 1 (12 PM PT)**: App submissions due
- **October 7**: Winners announced

**Location**: Global. Register at Luma, then submit your app to vibeapps.dev using the `modernstack` tag.

### How to Participate

1. **Build requirements**: Create a new app that starts on or after September 16 using one or more modern stack sponsors.
2. **Share**: Post about your app and tag sponsors on X/LinkedIn: `@convex_dev`, `@firecrawl_dev`, `@Vapi_AI`, `@better_auth`, `@resend`, `@autumnpricing`, `@openai`, `@inkeep_ai`, `@scorecardai`.
3. **Submit**: Add a video demo to Vibe Apps and select the `modernstack` tag before the deadline (no localhost submissions).

### Prize Pool — $25,000 in cash, credits, and prizes

- **Overall Winner**: $10,000 cash, 6 months Convex Pro, Resend (3 months free), Firecrawl Growth (3 months), Scorecard Growth (3 months), Better‑Auth merch, Autumn TRMNL e‑ink display, $1000 Vapi credits + swag, Convex swag
- **Second Place**: $3,000 cash, Resend (50% off for 3 months), Firecrawl Growth (3 months), Scorecard Growth (3 months), Convex swag
- **Third Place**: $2,000 cash, Resend (20% off for 3 months), Firecrawl Growth (3 months), Scorecard Growth (3 months), Convex swag
- **Category Prizes**: Best use of OpenAI ($5,000 credits), Best use of Inkeep ($2,000 cash)

### Sponsors

- Convex — Backend platform that keeps your app in sync
- OpenAI — Safe and beneficial AGI
- Firecrawl — Turn websites into LLM‑ready data
- Vapi — Voice AI agents for developers
- Better‑Auth — Comprehensive auth for TypeScript
- Autumn — Stripe for AI Startups
- Resend — Email for developers
- Inkeep — AI‑powered knowledge base
- Scorecard — Evaluate and ship enterprise AI agents

### Resources

- Convex Docs and Hackathon Resources
- Convex Community Discord
- Firecrawl Docs — use code `MODERNSTACK` for 20k credits
- Better‑Auth Docs
- Autumn Docs
- Resend Docs + Resend Convex Component
- OpenAI Docs

### Judges

Jamie Turner, Michael (RasMic) Shimeles, Wayne Sutton, Shawn Erquhart, Nicolas Ettlin, Moustafa Elhadary, Bereket Engida, Chris Pennington, Gergő Móricz, Dan Goosewin, Tanvir Ahmed, Omar McAdam, Gaurav Varma, Abraham Aremu, Darius Emrani, George Kalangi

---

## Tech Stack Used in This App

- **Next.js (App Router)**: frontend and API route for auth.
- **Convex**: server functions, agent threads, internal actions, rate limiting.
- **Better‑Auth**: authentication with email verification and password reset.
- **Resend**: transactional emails via Convex component.
- **Firecrawl**: search the web tool for product discovery.
- **Autumn**: usage tracking and gating for AI features.
- **Tailwind CSS + shadcn/ui + next-themes**: UI components and theming.

---

## App Routes

- `/` home
- `/login`, `/sign-up`, `/verify-email`, `/forgot-password`, `/change-password`, `/delete-user`
- `/thread` list/create threads
- `/thread/[thread-id]` chat view with streamed reasoning and web results

---

## Codebase Tour

- `convex/threads.ts`: Agent setup (model, tools), create/send/list/delete thread APIs, streaming, auth checks.
- `convex/tools.ts`: `firecrawlSearchWebTool`, `objectCreatorTool`, rate limiting, schema validation and usage tracking.
- `convex/firecrawl.ts`: Internal action calling Firecrawl SDK, validated results and timeouts.
- `convex/autumn.ts`: Autumn client wired to Convex + identify/track/check helpers.
- `convex/auth.ts`: Better‑Auth server config (email verification/reset using Resend), Convex adapter, `getCurrentUser` query.
- `convex/email.ts`: Resend integration with React Email templates.
- `src/app/ConvexClientProvider.tsx`: Single `ConvexReactClient` with `expectAuth: true` and Better‑Auth provider.
- `src/app/AutmnClientProvider.tsx`: Autumn provider bound to Convex client and API.
- `src/app/api/auth/[...all]/route.ts`: Better‑Auth Next.js handler.
- `src/app/thread/**/*`: Thread list, detail view, streamed messages, reasoning UI, web result carousel.

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm

### Install

```bash
pnpm install
```

### Environment Variables

Next.js (`.env.local`):

- `NEXT_PUBLIC_CONVEX_URL` — Convex URL (from local `convex dev` or deployed Convex)
- `BETTER_AUTH_SECRET` — app secret for Better‑Auth

Convex (set via CLI; stored in Convex env):

- `SITE_URL` — public base URL of your app (used by Better‑Auth emails)
- `OPENAI_API_KEY`
- `FIRECRAWL_API_KEY` — get credits with code `MODERNSTACK`
- `AUTUMN_SECRET_KEY`
- `RESEND_API_KEY`

Example commands:

```bash
# start Convex locally (prints a URL to use for NEXT_PUBLIC_CONVEX_URL)
pnpm convex dev

# in another terminal, set Convex env vars
npx convex env set SITE_URL https://localhost:3000
npx convex env set OPENAI_API_KEY sk-...
npx convex env set FIRECRAWL_API_KEY fc-...
npx convex env set AUTUMN_SECRET_KEY ...
npx convex env set RESEND_API_KEY re_...
```

Set `.env.local`:

```bash
echo "NEXT_PUBLIC_CONVEX_URL=https://<your-convex-url>" >> .env.local
echo "BETTER_AUTH_SECRET=$(openssl rand -hex 32)" >> .env.local
```

### Run

```bash
pnpm dev
```

Notes:

- Firecrawl tool is rate limited (1 call / 10s per user in this repo’s config).
- Update the email `from` domain in `convex/email.ts` to your verified Resend domain.

---

## Deployment

- Deploy Next.js to Vercel.
- Deploy Convex (Dashboard or CLI). Copy the Convex URL to `NEXT_PUBLIC_CONVEX_URL`.
- Set Convex env: `SITE_URL`, `OPENAI_API_KEY`, `FIRECRAWL_API_KEY`, `AUTUMN_SECRET_KEY`, `RESEND_API_KEY`.
- Set Vercel env: `NEXT_PUBLIC_CONVEX_URL`, `BETTER_AUTH_SECRET`.

---

## License

MIT (unless otherwise noted by included components/services).
