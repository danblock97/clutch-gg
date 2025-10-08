# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_KEY
ARG SUPABASE_SERVICE_KEY
ARG RIOT_API_KEY
ARG TFT_API_KEY
ARG RIOT_CLIENT_ID
ARG RIOT_CLIENT_SECRET
ARG RIOT_REDIRECT_URI
ARG POST_LOGOUT_REDIRECT_URI
ARG UPDATE_PROFILES_SECRET
ARG NEXT_PUBLIC_UPDATE_API_KEY
ARG APP_BASE_URL
ARG RIOT_API_RATE_LIMIT
ARG MATCHES_PER_PAGE
ARG MAX_MATCHES_TO_FETCH

# Set environment variables for build
# NEXT_PUBLIC_* vars are embedded into the bundle at build time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-https://placeholder.supabase.co}
ENV NEXT_PUBLIC_SUPABASE_KEY=${NEXT_PUBLIC_SUPABASE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder}
ENV NEXT_PUBLIC_UPDATE_API_KEY=${NEXT_PUBLIC_UPDATE_API_KEY:-placeholder_public_api_key}
ENV APP_BASE_URL=${APP_BASE_URL:-https://localhost:3000/}
ENV RIOT_REDIRECT_URI=${RIOT_REDIRECT_URI:-https://localhost:3000/api/auth/callback}
ENV POST_LOGOUT_REDIRECT_URI=${POST_LOGOUT_REDIRECT_URI:-https://localhost:3000/}
ENV RIOT_API_RATE_LIMIT=${RIOT_API_RATE_LIMIT:-100}
ENV MATCHES_PER_PAGE=${MATCHES_PER_PAGE:-20}
ENV MAX_MATCHES_TO_FETCH=${MAX_MATCHES_TO_FETCH:-100}
# Server-side secrets use placeholders during build - will be overridden at runtime
ENV SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder_service_role}
ENV RIOT_API_KEY=${RIOT_API_KEY:-RGAPI-00000000-0000-0000-0000-000000000000}
ENV TFT_API_KEY=${TFT_API_KEY:-RGAPI-00000000-0000-0000-0000-000000000000}
ENV RIOT_CLIENT_ID=${RIOT_CLIENT_ID:-00000000-0000-0000-0000-000000000000}
ENV RIOT_CLIENT_SECRET=${RIOT_CLIENT_SECRET:-placeholder_client_secret}
ENV UPDATE_PROFILES_SECRET=${UPDATE_PROFILES_SECRET:-00000000-0000-0000-0000-000000000000}

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"]
