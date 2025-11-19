## Base ##
FROM node:25.2.1-alpine3.22 AS base

RUN apk update --no-cache

## Builder ##
FROM base AS builder

WORKDIR /temp

COPY .yarn .yarn/
COPY .yarnrc.yml tsconfig.json yarn.lock package.json ./
COPY src/ src/

RUN yarn install --immutable && \
	yarn build && \
	yarn workspaces focus --production

## App ##
FROM base AS app

ENV NODE_ENV=production

WORKDIR /etc/poyoyo

COPY --from=builder /temp/node_modules node_modules/
COPY --from=builder /temp/dist dist/
COPY --from=builder /temp/package.json ./

VOLUME /etc/poyoyo/data

CMD ["node", "--enable-source-maps", "dist/main.js"]
