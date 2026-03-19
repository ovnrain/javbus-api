FROM node:lts-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# -------------------

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --ignore-scripts --frozen-lockfile

# -------------------

FROM base AS prod-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --ignore-scripts --prod --frozen-lockfile

# -------------------

FROM base AS build

COPY --from=deps /app/node_modules /app/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json eslint.config.mjs .prettierrc ./
COPY api ./api
COPY public ./public

RUN pnpm run lint && \
  pnpm run build

# -------------------

FROM node:lts-slim AS runtime

RUN apt-get update && \
  apt-get install -y --no-install-recommends tini && \
  rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
USER node

WORKDIR /app

COPY --chown=node:node --from=prod-deps /app/node_modules /app/node_modules
COPY --chown=node:node --from=build /app/dist /app/dist
COPY --chown=node:node --from=build /app/package.json /app/package.json
COPY --chown=node:node --from=build /app/public /app/public

EXPOSE 3000

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD [ "node", "dist/server.js" ]
