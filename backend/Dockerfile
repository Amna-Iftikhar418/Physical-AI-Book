FROM python:3.11-slim

WORKDIR /app

# Build tools needed by bcrypt and cryptography (passlib + python-jose deps)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
