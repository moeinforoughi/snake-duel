# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install --upgrade pip && pip install uv
RUN uv sync
EXPOSE 8000
CMD ["uv", "run", "python", "main.py"]