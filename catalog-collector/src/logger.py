"""Structured logging for catalog-collector.

Outputs to stdout, captured by Docker -> Fluent Bit -> OpenObserve.
Set STRUCTLOG_FORMAT=json for JSON output (recommended for OpenObserve ingestion).
"""

import logging
import os
from typing import Any

import structlog


def _build_processors() -> list[Any]:
    """Build the structlog processor chain."""
    shared = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
    ]

    if os.environ.get("STRUCTLOG_FORMAT", "").lower() == "json":
        return [*shared, structlog.processors.JSONRenderer()]

    return [*shared, structlog.dev.ConsoleRenderer()]


structlog.configure(
    processors=_build_processors(),
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

log = structlog.get_logger(service="catalog-collector")
