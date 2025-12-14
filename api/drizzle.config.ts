import { env } from '@/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  out: './src/db/migrations',
  dbCredentials: {
    url: env.DATABASE_URL
  },
  schema: './src/db/schema/index.ts',
  casing: 'snake_case'
})