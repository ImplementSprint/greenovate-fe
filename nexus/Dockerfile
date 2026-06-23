FROM node:22-alpine3.23 AS base

RUN apk upgrade --no-cache

FROM base AS builder

WORKDIR /app

# Copy package info and lock files
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .

# Set build-time variables for Next.js
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build the Next.js app
RUN npm run build:POS-frontend

# Production image
FROM base AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# Set environment variables
ENV PORT=3030
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Copy the standalone output and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3030

CMD ["node", "server.js"]
