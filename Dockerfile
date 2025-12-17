# === 第一阶段：构建前端 ===
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend

# 利用缓存层
COPY frontend/package.json ./
RUN npm install

# 拷贝源码并构建
COPY frontend/ .
RUN npm run build

# === 第二阶段：构建后端 ===
FROM python:3.11-slim
WORKDIR /app

# 安装依赖 (包含 gunicorn)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝后端代码
COPY backend/ .

# 从前端构建阶段拷贝静态资源
COPY --from=frontend-builder /app/backend/static ./static

# 环境变量
ENV PORT=5000

EXPOSE 5000

# 【优化】使用 Gunicorn 启动，4 个工作进程，绑定 0.0.0.0
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]