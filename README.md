# Vyne

> A visual design system editor that connects to your GitHub repo, lets you live-edit shadcn/ui component props and tokens, and pushes changes back as a Pull Request.

Vyne bridges the gap between design and code. Connect your repo, tweak your components visually using the Dial Kit panel, and ship changes directly to GitHub — no manual file editing required.

---

## Features

- **GitHub OAuth** — sign in with your GitHub account, no separate password
- **Workspace onboarding** — connect a repo, pick a branch and component directory in minutes
- **Component Browser** — visual grid of all your shadcn/ui components with live sync status
- **Dial Kit Editor** — live canvas with sliders, selects, and toggles for every prop and design token
- **Component Presets** — save and recall named variants of any component
- **Two-way GitHub Sync** — pull current values from your repo, push changes back as a PR
- **Code Snippet Generator** — copy ready-to-paste JSX/TSX from your current Dial Kit state
- **Team Workspaces** — invite collaborators with role-based access (Admin, Editor, Viewer)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| API | [tRPC](https://trpc.io) + [Zod](https://zod.dev) |
| Database | [Prisma](https://prisma.io) + [Neon](https://neon.tech) (hosted Postgres) |
| Auth | [Auth.js v5](https://authjs.dev) — GitHub OAuth |
| GitHub API | [@octokit/rest](https://github.com/octokit/rest.js) |
| State | [Zustand](https://zustand-demo.pmnd.rs) + [TanStack Query](https://tanstack.com/query) |

---

## Prerequisites

- **Node.js ≥ 20** — use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm)
- A [Neon](https://neon.tech) account for hosted Postgres
- A GitHub OAuth App (instructions below)

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/rohannrk/vyne.git
cd vyne

# 2. Install dependencies
npm install

# 3. Copy the example env file and fill in your values
cp .env.example .env.local
```

Open `.env.local` and fill in the following:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | [neon.tech](https://neon.tech) → New Project → Connection String |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in your terminal |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `GITHUB_CLIENT_ID` | See below |
| `GITHUB_CLIENT_SECRET` | See below |

### Creating a GitHub OAuth App

1. Go to [GitHub → Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set **Homepage URL** to `http://localhost:3000`
4. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
5. Copy the **Client ID** and generate a **Client Secret**

```bash
# 4. Run database migrations
npx prisma migrate dev

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── [workspaceId]/    # Workspace dashboard + component editor
│   ├── onboarding/       # 4-step onboarding flow
│   └── login/            # GitHub OAuth sign-in
├── components/
│   ├── ui/               # shadcn/ui local component install
│   ├── onboarding/       # Onboarding form components
│   ├── browser/          # Component grid and cards
│   └── editor/           # Dial Kit panel + canvas
├── server/trpc/          # tRPC routers (workspace, github, components, auth)
├── lib/
│   ├── auth/             # Auth.js configuration
│   ├── db/               # Prisma singleton
│   ├── github/           # Octokit client + pull/push helpers
│   └── trpc/             # tRPC client (browser + server)
├── types/                # Shared TypeScript types + Zod schemas
└── store/                # Zustand stores
prisma/
├── schema.prisma         # Database schema
└── migrations/           # Migration history
```

---

## Deployment

Vyne deploys to [Vercel](https://vercel.com) with zero config.

1. Import the repo on [vercel.com/new](https://vercel.com/new)
2. Add the same 5 environment variables from `.env.local` to your Vercel project settings
3. Update `NEXTAUTH_URL` to your production domain
4. Update your GitHub OAuth App's callback URL to `https://your-domain.com/api/auth/callback/github`

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected, requires PR |
| `dev` | Integration — all features merge here first |
| `feat/*` | One branch per story/feature |

---

## License

MIT © [Rohan Kambli](https://github.com/rohannrk)
