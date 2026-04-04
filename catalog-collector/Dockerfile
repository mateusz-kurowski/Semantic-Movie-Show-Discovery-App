FROM ghcr.io/astral-sh/uv:debian-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_NO_DEV=1

WORKDIR /app

# Now copy our source code 
COPY pyproject.toml uv.lock ./

# Install final project package
RUN uv sync --frozen

COPY src/ src/


CMD ["uv", "run", "opentelemetry-instrument", "python", "src/main.py"]
