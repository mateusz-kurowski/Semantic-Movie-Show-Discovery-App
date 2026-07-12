FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY . .

FROM oven/bun:1-alpine AS runtime

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=build --chown=app:app /app .

ENV NODE_ENV=production

EXPOSE 3000

USER app

CMD ["bun", "run", "src/index.ts"]
