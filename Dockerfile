FROM oven/bun:alpine

WORKDIR /app

COPY package.json ./
COPY bun.lockb ./
COPY src ./src
COPY tsconfig.json ./
COPY public ./public

RUN bun install --production

ARG PG_VERSION='16'
RUN apk add --update --no-cache postgresql${PG_VERSION}-client --repository=https://dl-cdn.alpinelinux.org/alpine/edge/main

ENV NODE_ENV production

CMD pg_isready --dbname=$BACKUP_DATABASE_URL && \
    pg_dump --version && \
    bun /app/src/index.tsx

EXPOSE 3000
