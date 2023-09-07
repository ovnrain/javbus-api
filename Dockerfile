FROM node:hydrogen-alpine AS base

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

FROM node:hydrogen-alpine

RUN apk add --no-cache tini

ENV NODE_ENV production
USER node

WORKDIR /app

COPY --chown=node:node --from=prod-deps /app/node_modules /app/node_modules
COPY --chown=node:node --from=build /app/dist /app/dist
COPY --chown=node:node --from=build /app/package.json /app/package.json
COPY --chown=node:node --from=build /app/public /app/public

EXPOSE 3000

CMD [ "/sbin/tini", "--", "node", "dist/server.js" ]
