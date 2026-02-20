FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless \
    gcc \
    libpq-dev \
    python3-dev \
    build-essential \
    curl \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt groq

COPY . .

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
