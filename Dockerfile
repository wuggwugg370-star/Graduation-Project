# === 第一阶段：构建前端 ===
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# === 第二阶段：构建后端 ===
FROM python:3.11-slim
WORKDIR /app

# 复制依赖并安装 (包含 gunicorn)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
# 从前端构建阶段复制静态文件
COPY --from=frontend-builder /app/backend/static ./static

ENV PORT=5000
EXPOSE 5000

# 启动命令 (确保 requirements.txt 里有 gunicorn)
CMD ["gunicorn", "-w", "1", "-b", "0.0.0.0:5000", "app:app"]