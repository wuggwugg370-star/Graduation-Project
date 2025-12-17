# === 第一阶段：构建前端 ===
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend

# 先拷贝 package.json 缓存依赖
COPY frontend/package.json ./
RUN npm install

# 拷贝源码并构建
COPY frontend/ .
RUN npm run build
# 构建产物生成在 ../backend/static (由 vite.config.js 指定)

# === 第二阶段：构建后端 ===
FROM python:3.11-slim
WORKDIR /app

# 安装依赖
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝后端代码
COPY backend/ .

# 【关键】从第一阶段拷贝构建好的静态文件
# 我们在 vite 配置中已经把 outDir 设置为了 ../backend/static
# 但在 Docker 构建上下文中，我们需要把 frontend-builder 里生成的 /app/backend/static 拷过来
COPY --from=frontend-builder /app/backend/static ./static

# 环境变量
ENV FLASK_APP=app.py
ENV PORT=5000

EXPOSE 5000

CMD ["python", "app.py"]