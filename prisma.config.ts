import * as dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Next.js uses .env.local — load it for Prisma CLI commands
dotenv.config({ path: '.env.local', override: true })

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
