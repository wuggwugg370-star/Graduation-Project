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

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend-builder /app/backend/static ./static

ENV PORT=5000
EXPOSE 5000

# [关键修改] 将 -w 4 改为 -w 1，避免多进程导致的数据不一致
CMD ["gunicorn", "-w", "1", "-b", "0.0.0.0:5000", "app:app"]