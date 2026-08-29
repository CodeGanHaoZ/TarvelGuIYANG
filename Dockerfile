# ---------- 基础镜像：Node 22（满足 engines >=22.13.0） ----------
FROM node:22.13-alpine AS base
RUN npm install -g pnpm@11.24.0
WORKDIR /app

# ---------- 安装全量依赖（构建用） ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- 构建 ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---------- 运行镜像（使用 standalone 输出） ----------
FROM node:22.13-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 复制 standalone 构建产物
COPY --from=build /app/dist/standalone/ ./

EXPOSE 3000
CMD ["node", "server.js"]
