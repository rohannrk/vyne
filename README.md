# Vyne

A component design tool that lets you visually tweak shadcn/ui components and sync changes back to your GitHub repo.

## Prerequisites

- **Node.js ≥ 20** (LTS recommended — use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm))
- A [Neon](https://neon.tech) account for hosted Postgres
- A GitHub OAuth App for authentication

## Local Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
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

1. Go to [github.com → Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set **Homepage URL** to `http://localhost:3000`
4. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
5. Copy the **Client ID** and generate a **Client Secret**

```bash
# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **shadcn/ui** component library
- **Prisma** + Neon Postgres
- **Auth.js** (GitHub OAuth)
- **tRPC** + **Zod**

## Deployment

This app deploys to [Vercel](https://vercel.com) with zero config. After deploying, set the same 5 environment variables in your Vercel project dashboard.
