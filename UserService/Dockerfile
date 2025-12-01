# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG PYTHON_VERSION=3.13.3
FROM python:${PYTHON_VERSION}-slim as base

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        pkg-config \
        default-libmysqlclient-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-bes    t-practices/
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# Leverage a bind mount to requirements.txt to avoid having to copy them into
# into this layer.
RUN python -m pip install --upgrade pip
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt
    
# Switch to the non-privileged user to run the application.
USER appuser

# Copy the source code into the container.
COPY . .



WORKDIR /app/UserService
# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.

# run gunicorn with uvicorn workers
CMD gunicorn -k uvicorn.workers.UvicornWorker UserService.asgi:application \
    --bind 0.0.0.0:8000 \
    --workers ${GUNICORN_WORKERS:-9} \
    --worker-connections ${GUNICORN_WORKER_CONNECTIONS:-2000} \
    --backlog 4096 \
    --timeout ${GUNICORN_TIMEOUT:-30} \
    --keep-alive 5 \
    --max-requests 10000 \
    --max-requests-jitter 1000 \
    --log-level ${GUNICORN_LOG_LEVEL:-warning} \
    --worker-tmp-dir /dev/shm
