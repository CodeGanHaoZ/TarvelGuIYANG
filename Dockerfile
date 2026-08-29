# ---------- 基础镜像：Node 22（满足 engines >=22.13.0） ----------
FROM node:22.13-alpine AS base
RUN npm install -g pnpm@11.24.0
WORKDIR /app

# ---------- 全量依赖（构建用） ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- 构建 ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---------- 生产依赖（运行时用，体积更小） ----------
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---------- 运行镜像 ----------
FROM node:22.13-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 3000
CMD ["npx", "vinext", "start"]
