FROM node:22.13-bookworm-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY package.json ./
# 如果存在 lockfile 也复制（支持多种包管理器）
COPY package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# 使用 npm 安装依赖（最稳定，Docker 环境兼容性最好）
RUN npm install

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 生产环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# 启动服务器
CMD ["node", "dist/standalone/server.js"]
