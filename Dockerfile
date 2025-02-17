FROM node:22-alpine AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM deps
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

RUN pnpm build:frontend

CMD ["pnpm", "exec", "pm2-runtime", "pm2.config.js"]
