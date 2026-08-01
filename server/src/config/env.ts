import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CLIENT_URL: z.string().url(),
  SERVER_URL: z.string().url(),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.string().default('587').transform(Number),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  FROM_EMAIL: z.string().optional().default(''),
  SSLCOMMERZ_STORE_ID: z.string().min(1),
  SSLCOMMERZ_STORE_PASS: z.string().min(1),
  SSLCOMMERZ_IS_LIVE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.string().default('5242880').transform(Number),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  parsed.error.errors.forEach((err) => {
    console.error(`   ${err.path.join('.')}: ${err.message}`)
  })
  process.exit(1)
}

export const env = parsed.data