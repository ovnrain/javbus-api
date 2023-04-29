# build stage
FROM node:hydrogen-alpine AS builder

RUN npm i -g pnpm

# Create app directory
WORKDIR /app

COPY . .

RUN pnpm i --ignore-scripts && pnpm build && pnpm prune --prod --config.ignore-scripts=true

# run stage
FROM node:hydrogen-alpine

RUN apk add --no-cache tini

ENV NODE_ENV production
USER node

WORKDIR /app

COPY --chown=node:node public public
COPY --chown=node:node --from=builder /app/node_modules node_modules/
COPY --chown=node:node --from=builder /app/dist dist/

EXPOSE 3000

CMD [ "/sbin/tini", "--", "node", "dist/server.mjs" ]
