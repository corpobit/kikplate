FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV API_INTERNAL_URL=http://localhost:3001

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/public ./app/public
COPY --from=builder --chown=app:app /app/.next/standalone/app ./app
COPY --from=builder --chown=app:app /app/.next/static ./app/.next/static

USER app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "app/server.js"]
