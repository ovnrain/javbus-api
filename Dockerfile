# build stage
FROM node:lts AS builder

# Create app directory
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src src

RUN npm run build && npm prune --production

# run stage
FROM node:lts-alpine

RUN apk add --no-cache tini

ENV NODE_ENV production
USER node

WORKDIR /app

COPY --chown=node:node --from=builder /app/node_modules node_modules/
COPY --chown=node:node --from=builder /app/dist dist/

EXPOSE 3000

CMD [ "/sbin/tini", "--", "node", "dist/server.js" ]
