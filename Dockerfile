FROM node:iron-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY . .

# -------------------

FROM base AS prod-deps

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --ignore-scripts --prod --frozen-lockfile

# -------------------

FROM base AS build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --ignore-scripts --frozen-lockfile && \
  pnpm run build

# -------------------

FROM node:iron-alpine

RUN apk add --no-cache tini

ENV NODE_ENV production
USER node

WORKDIR /app

COPY --chown=node:node --from=prod-deps /app/node_modules /app/node_modules
COPY --chown=node:node --from=build /app/.next /app/.next
COPY --chown=node:node --from=build /app/package.json /app/package.json

EXPOSE 3000

CMD [ "/sbin/tini", "--", "npm", "start" ]
