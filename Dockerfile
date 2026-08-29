FROM node:22.13-bookworm-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 启用 corepack 使用 pnpm
RUN corepack enable && corepack prepare pnpm@11.24.0 --activate

# 复制依赖文件并安装
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源代码并构建
COPY . .
RUN pnpm build

# 生产环境
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# 使用 standalone 模式启动
CMD ["node", "dist/standalone/server.js"]
