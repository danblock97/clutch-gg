# --- Build stage ---
FROM node:20-alpine AS builder

# Avoid telemetry and keep build clean
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Needed by some Node binaries on Alpine
RUN apk add --no-cache libc6-compat

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build
COPY . .

# Expose public build-time vars so Next.js can inline them
# (values are supplied via docker-compose build args)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_KEY
ARG NEXT_PUBLIC_UPDATE_API_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_KEY=${NEXT_PUBLIC_SUPABASE_KEY}
ENV NEXT_PUBLIC_UPDATE_API_KEY=${NEXT_PUBLIC_UPDATE_API_KEY}

# Build Next.js (standalone output is enabled in next.config.mjs)
RUN npm run build


# --- Runtime stage ---
FROM node:20-alpine AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy the minimal standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# Run the standalone server (Next.js production)
CMD ["node", "server.js"]

