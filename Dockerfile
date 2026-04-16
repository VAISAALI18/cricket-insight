# ──────────────────────────────────────────────
# Stage 1: Builder — install deps & run tests
# ──────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Run unit tests — build FAILS if tests fail
ENV ENABLE_METRICS=false
RUN pytest tests/ -v --tb=short

# ──────────────────────────────────────────────
# Stage 2: Production — lean final image
# ──────────────────────────────────────────────
FROM python:3.11-slim AS production

WORKDIR /app

# Non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy only installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app

# Remove test files from production image
RUN rm -rf /app/tests /app/.pytest_cache

USER appuser

EXPOSE 5000

ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

CMD ["python", "app.py"]
