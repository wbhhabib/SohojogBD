import { CorsOptions } from 'cors'
import { env } from './env'

const allowedOrigins = Array.from(
  new Set(
    [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001']
      .filter(Boolean)
      .map((o) => o.replace(/\/$/, ''))
  )
)

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {

    if (!origin) return callback(null, true)
    const normalized = origin.replace(/\/$/, '')
    if (allowedOrigins.includes(normalized)) return callback(null, true)
    callback(new Error(`CORS: origin '${origin}' not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}