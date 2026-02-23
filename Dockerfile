FROM node:20-bookworm-slim AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

FROM base AS builder

ARG APP_BASE_URL
ARG DEBUG_FETCH_COUNTER
ARG MATCHES_PER_PAGE
ARG MAX_MATCHES_TO_FETCH
ARG NEXT_PUBLIC_DEBUG_FETCH_COUNTER
ARG NEXT_PUBLIC_SUPABASE_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_UPDATE_API_KEY
ARG POST_LOGOUT_REDIRECT_URI
ARG RIOT_API_KEY
ARG RIOT_API_RATE_LIMIT
ARG RIOT_CLIENT_ID
ARG RIOT_CLIENT_SECRET
ARG RIOT_REDIRECT_URI
ARG SUPABASE_SERVICE_KEY
ARG TFT_API_KEY
ARG UPDATE_PROFILES_SECRET

ENV APP_BASE_URL=$APP_BASE_URL \
    DEBUG_FETCH_COUNTER=$DEBUG_FETCH_COUNTER \
    MATCHES_PER_PAGE=$MATCHES_PER_PAGE \
    MAX_MATCHES_TO_FETCH=$MAX_MATCHES_TO_FETCH \
    NEXT_PUBLIC_DEBUG_FETCH_COUNTER=$NEXT_PUBLIC_DEBUG_FETCH_COUNTER \
    NEXT_PUBLIC_SUPABASE_KEY=$NEXT_PUBLIC_SUPABASE_KEY \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_UPDATE_API_KEY=$NEXT_PUBLIC_UPDATE_API_KEY \
    POST_LOGOUT_REDIRECT_URI=$POST_LOGOUT_REDIRECT_URI \
    RIOT_API_KEY=$RIOT_API_KEY \
    RIOT_API_RATE_LIMIT=$RIOT_API_RATE_LIMIT \
    RIOT_CLIENT_ID=$RIOT_CLIENT_ID \
    RIOT_CLIENT_SECRET=$RIOT_CLIENT_SECRET \
    RIOT_REDIRECT_URI=$RIOT_REDIRECT_URI \
    SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY \
    TFT_API_KEY=$TFT_API_KEY \
    UPDATE_PROFILES_SECRET=$UPDATE_PROFILES_SECRET

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
